# {% toc %}  ->  table of contents built from the current post's <h2>..<h4>.
#
# Why a Liquid tag and not kramdown's {:toc}: {:toc} has to sit on the line
# directly below a list with no blank line in between, which the Jekyll-Admin
# WYSIWYG editor can't preserve (it always puts a blank line between blocks).
# A Liquid tag survives any round-trip. The emitted markup and the
# #markdown-toc id match kramdown's own {:toc} output, so _sass/_default.scss
# styles both the same way, and existing {:toc} posts keep working untouched.
#
# No Nokogiri (see the jemoji note in _config.yml): the tag only reads the ids
# that kramdown's auto_ids already placed on the headings.

module CapsopToc
  MARKER  = "<!--capsop-toc-->".freeze
  HEADING = %r{<h([2-4])\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</h\1>}m
  MIN     = 2

  class Tag < Liquid::Tag
    def render(_context)
      MARKER
    end
  end

  module_function

  def build(html)
    heads = html.to_s.scan(HEADING).map { |lvl, id, text| [lvl.to_i, id, strip_links(text)] }
    return "" if heads.empty?

    out   = +%(<ul id="markdown-toc">\n)
    depth = MIN
    heads.each_with_index do |(level, id, text), i|
      level = MIN if level < MIN
      if i.positive?
        if level > depth
          out << ("<ul>\n" * (level - depth))
        elsif level < depth
          out << "</li>\n" << ("</ul>\n</li>\n" * (depth - level))
        else
          out << "</li>\n"
        end
      end
      out << %(<li><a href="##{id}">#{text}</a>)
      depth = level
    end
    out << "</li>\n" << ("</ul>\n</li>\n" * (depth - MIN)) << "</ul>\n"
  end

  def strip_links(text)
    text.gsub(%r{</?a\b[^>]*>}, "").strip
  end

  def inject(doc)
    return unless doc.output.to_s.include?(MARKER)

    toc = build(doc.content)
    doc.content = doc.content.sub(MARKER) { "" }
    doc.output  = doc.output
                     .sub(%r{<p>\s*#{Regexp.escape(MARKER)}\s*</p>}) { toc }
                     .sub(MARKER) { toc }
  end
end

Liquid::Template.register_tag("toc", CapsopToc::Tag)

Jekyll::Hooks.register([:posts, :pages], :post_render) do |doc|
  CapsopToc.inject(doc)
end
