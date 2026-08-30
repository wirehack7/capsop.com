# {{ content | reading_time }} -> whole minutes, code blocks excluded (this blog
# pastes huge nmap/gdb dumps that would wildly inflate a naive word count).

module ReadingTime
  WPM = 200.0

  def reading_time(input)
    text = input.to_s.dup
    text.gsub!(/^```.*?^```/m, "")          # fenced code (raw markdown)
    text.gsub!(%r{<pre\b.*?</pre>}m, "")    # code blocks (rendered html)
    text.gsub!(/<[^>]+>/, " ")              # strip remaining tags
    minutes = (text.split.size / WPM).ceil
    minutes < 1 ? 1 : minutes
  end
end

Liquid::Template.register_filter(ReadingTime)
