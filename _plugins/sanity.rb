# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'
require 'cgi'

# --- PHẦN 1: LIQUID FILTER ĐỂ RENDER PORTABLE TEXT ---
module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      return "" if input.nil? || input.empty?

      # Nếu input đã là Array, không cần parse nữa
      begin
        blocks = input.is_a?(Array) ? input : JSON.parse(input)
      rescue JSON::ParserError => e
        puts "Lỗi JSON Parse trong portable_text_to_html: #{e.message}"
        puts "Input nhận được: #{input.inspect}"
        return "<p>Lỗi render nội dung.</p>"
      end

      return "" unless blocks.is_a?(Array)

      html = ""
      blocks.each do |block|
        # Bỏ qua các block không phải 'block' hoặc không có 'children'
        next unless block['_type'] == 'block' && block['children']

        # Xử lý children (spans)
        content = ""
        block['children'].each do |child|
          next unless child['_type'] == 'span' && child['text']
          
          text = child['text']
          # Bạn có thể mở rộng thêm để xử lý marks (bold, italic, links...)
          # Ví dụ:
          # if child['marks']&.include?('strong')
          #   text = "<strong>#{text}</strong>"
          # end
          content += text
        end

        style = block['style'] || 'normal'

        # Render HTML dựa trên style
        case style
        when 'h1' then html += "<h1>#{content}</h1>"
        when 'h2' then html += "<h2>#{content}</h2>"
        when 'h3' then html += "<h3>#{content}</h3>"
        when 'blockquote' then html += "<blockquote><p>#{content}</p></blockquote>"
        # Bạn có thể thêm các case khác như 'bullet', 'number'
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
  # Chỉ chạy khi có API token (ví dụ: khi build trên production)
  # next unless ENV['SANITY_API_TOKEN']
  
  # Bỏ dòng 'next unless' ở trên nếu bạn muốn chạy cả ở local
  # và đảm bảo bạn đã set ENV['SANITY_API_TOKEN'] ở local
  token = ENV['SANITY_API_TOKEN']
  unless token
    puts "Bỏ qua fetch Sanity: không tìm thấy SANITY_API_TOKEN."
    next
  end

  puts "Fetching data from Sanity.io..."

  project_id = '7psj6s2s' # Thay project_id của bạn vào đây
  dataset = 'production'  # Thay dataset của bạn vào đây

  query = '*[_type == "post"] { title, slug, publishedAt, "author": author->name, "image": mainImage.asset->url, body } | order(publishedAt desc)'
  
  url = "https://#{project_id}.api.sanity.io/v1/data/query/#{dataset}?query=#{CGI.escape(query)}"

  response = HTTParty.get(url, headers: { 'Authorization' => "Bearer #{token}" })

  if response.success?
    posts = JSON.parse(response.body)['result']
    posts_dir = File.join(site.source, '_posts')
    FileUtils.mkdir_p(posts_dir)

    posts.each do |post|
      next unless post['slug'] && post['slug']['current']

      slug = post['slug']['current']
      date_str = post['publishedAt']
      
      # Đảm bảo publishedAt không bị null
      unless date_str
          puts "Bỏ qua post '#{post['title']}' vì không có publishedAt."
          next
      end
      
      date = Time.parse(date_str).strftime('%Y-%m-%d')
      filename = "#{date}-#{slug}.md"
      path = File.join(posts_dir, filename)

      # Chuyển body (là một Array/Hash) thành một chuỗi JSON
      # Đảm bảo body không bị null
      json_string = (post['body'] || []).to_json

      # Tạo nội dung front matter
      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{date_str}
        author: #{post['author'] ? post['author'].inspect : '"Việt Sáng Home"'}
        image: #{post['image'].inspect if post['image']}
        
        # SỬA LỖI Ở ĐÂY:
        # Dùng .inspect để Ruby tự động escape chuỗi JSON
        # cho đúng chuẩn YAML front matter.
        body_json: #{json_string.inspect}
        ---
      MARKDOWN

      File.write(path, content)
    end
    puts "=> Tạo thành công #{posts.length} bài viết từ Sanity."
  else
    puts "Lỗi fetch Sanity: #{response.code} - #{response.message}"
    puts "Response body: #{response.body}"
  end
rescue => e
  puts "Lỗi plugin Sanity: #{e.message}"
  puts e.backtrace.join("\n")
end