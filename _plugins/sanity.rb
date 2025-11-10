# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'
require 'cgi'  # ← THÊM DÒNG NÀY

# --- PHẦN 1: LIQUID FILTER ĐỂ RENDER PORTABLE TEXT ---
module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      return "" if input.nil? || input.empty?

      # Nếu input đã là Array, không cần parse nữa
      blocks = input.is_a?(Array) ? input : JSON.parse(input)

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

# --- PHẦN 2: FETCH DATA VÀ TẠO FILE BÀI VIẾT ẢO ---
Jekyll::Hooks.register :site, :after_init do |site|
  next unless ENV['SANITY_API_TOKEN']

  puts "Fetching data from Sanity.io..."

  project_id = '7psj6s2s'
  dataset = 'production'
  token = ENV['SANITY_API_TOKEN']

  query = '*[_type == "post"] { title, slug, publishedAt, "author": author->name, "image": mainImage.asset->url, body } | order(publishedAt desc)'
  
  # SỬA: DÙNG CGI.escape
  url = "https://#{project_id}.api.sanity.io/v1/data/query/#{dataset}?query=#{CGI.escape(query)}"

  response = HTTParty.get(url, headers: { 'Authorization' => "Bearer #{token}" })

  if response.success?
    posts = JSON.parse(response.body)['result']
    posts_dir = File.join(site.source, '_posts')  # Dùng site.source
    FileUtils.mkdir_p(posts_dir)

    posts.each do |post|
      next unless post['slug'] && post['slug']['current']

      slug = post['slug']['current']
      date = Time.parse(post['publishedAt']).strftime('%Y-%m-%d')
      filename = "#{date}-#{slug}.md"
      path = File.join(posts_dir, filename)

      json_str = post['body'].to_json
      escaped_json = json_str.gsub(/\\/, '\\\\').gsub(/"/, '\\"')

      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{post['publishedAt']}
        author: #{post['author'] ? post['author'].inspect : '"Việt Sáng Home"'}
        image: #{post['image'].inspect if post['image']}
        body_json: "#{escaped_json}"
        ---
      MARKDOWN

      File.write(path, content)
    end
    puts "=> Tạo thành công #{posts.length} bài viết từ Sanity."
  else
    puts "Lỗi fetch Sanity: #{response.code} - #{response.message}"
  end
rescue => e
  puts "Lỗi plugin Sanity: #{e.message}"
end