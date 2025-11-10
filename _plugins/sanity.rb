# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'

module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      blocks = JSON.parse(input) rescue []
      return "" unless blocks.is_a?(Array)
      html = ""
      blocks.each do |block|
        next unless block['_type'] == 'block' && block['children']
        content = block['children'].map { |c| c['text'] }.join
        style = block['style'] || 'normal'
        case style
        when 'h1' then html += "<h1>#{content}</h1>"
        when 'h2' then html += "<h2>#{content}</h2>"
        when 'h3' then html += "<h3>#{content}</h3>"
        when 'blockquote' then html += "<blockquote><p>#{content}</p></blockquote>"
        else html += "<p>#{content}</p>"
        end
      end
      html
    end
  end
end
Liquid::Template.register_filter(Jekyll::SanityFilter)

Jekyll::Hooks.register :site, :after_init do |site|
  next unless ENV['SANITY_API_TOKEN']
  puts "Fetching data from Sanity.io..."
  project_id = '7psj6s2s'
  dataset = 'production'
  token = ENV['SANITY_API_TOKEN']
  query = '*[_type == "post"] { title, slug, publishedAt, "author": author->name, "image": mainImage.asset->url, body } | order(publishedAt desc)'
  url = "https://#{project_id}.api.sanity.io/v1/data/query/#{dataset}?query=#{URI.encode(query)}"
  response = HTTParty.get(url, headers: { 'Authorization' => "Bearer #{token}" })
  if response.success?
    posts = JSON.parse(response.body)['result']
    posts_dir = site.in_source_dir('_posts')
    FileUtils.mkdir_p(posts_dir)
    posts.each do |post|
      slug = post['slug']['current']
      date = Time.parse(post['publishedAt']).strftime('%Y-%m-%d')
      path = File.join(posts_dir, "#{date}-#{slug}.md")
      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{post['publishedAt']}
        author: #{post['author'] ? post['author'].inspect : 'Việt Sáng Home'}
        image: #{post['image'].inspect if post['image']}
        body_json: #{post['body'].to_json}
        ---
      MARKDOWN
      File.write(path, content)
    end
    puts "=> Successfully created #{posts.length} post files from Sanity."
  else
    puts "Error fetching from Sanity: #{response.code}"
  end
end