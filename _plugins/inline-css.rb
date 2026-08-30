# Compile css/main.scss once per build and expose it as site.inline_css so the
# layout can drop it into a <style> tag. Inlining means a CDN can never serve a
# stale stylesheet (the HTML itself is never cached), and it kills the FOUC.
#
# Uses the site's *configured* Scss converter (find_converter_instance) - the
# `scssify` Liquid filter builds an unconfigured one that can't resolve @use.

Jekyll::Hooks.register :site, :pre_render do |site|
  scss_path = File.join(site.source, "css", "main.scss")
  next unless File.exist?(scss_path)

  raw = File.read(scss_path).sub(/\A---\s*\n.*?\n---\s*\n/m, "")
  converter = site.find_converter_instance(Jekyll::Converters::Scss)
  site.config["inline_css"] = converter.convert(raw).sub(/\A@charset "UTF-8";\s*/, "")
end
