# _plugins/sanity_filter.rb
module Jekyll
  module SanityFilter
    def array_to_html(input)
      return "" unless input.is_a?(Array)

      input.map do |block|
        next unless block['_type'] == 'block'

        content = block['children'].map { |c| c['text'] }.join
        style = block['style'] || 'normal'

        case style
        when 'h1' then "<h1>#{content}</h1>"
        when 'h2' then "<h2>#{content}</h2>"
        when 'h3' then "<h3>#{content}</h3>"
        when 'blockquote' then "<blockquote>#{content}</blockquote>"
        else "<p>#{content}</p>"
        end
      end.compact.join
    end
  end
end

Liquid::Template.register_filter(Jekyll::SanityFilter)