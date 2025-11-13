# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'
require 'cgi' 

# --- PHẦN 1: LIQUID FILTER ĐỂ RENDER PORTABLE TEXT (GIỮ NGUYÊN) ---
module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      return "" if input.nil? || input.empty?

      begin
        # Logic này giờ sẽ hoạt động hoàn hảo vì input sẽ luôn là String
        blocks = input.is_a?(String) ? JSON.parse(input) : input
      rescue JSON::ParserError => e
        puts "Lỗi JSON Parse trong portable_text_to_html: #{e.message}"
        return "<p>Lỗi render nội dung.</p>"
      end

      return "" unless blocks.is_a?(Array)

      html = ""
      list_open = false 

      blocks.each_with_index do |block, index|
        if block['_type'] == 'block' && block['children']
          is_list_item = block['listItem'] == 'bullet'
          
          if is_list_item && !list_open
            html += "<ul>\n"
            list_open = true
          end
          
          if !is_list_item && list_open
             html += "</ul>\n"
             list_open = false
          end

          content = ""
          block['children'].each do |child|
            next unless child['_type'] == 'span' && child['text']
            text = CGI.escapeHTML(child['text']) 
            
            if child['marks']&.any?
              (child['marks'] || []).reverse.each do |mark_key|
                if mark = block['markDefs']&.find { |md| md['_key'] == mark_key }
                  if mark['_type'] == 'link'
                    text = "<a href='#{CGI.escapeHTML(mark['href'])}' target='_blank' rel='noopener noreferrer'>#{text}</a>"
                  end
                elsif mark_key == 'strong'
                  text = "<strong>#{text}</strong>"
                elsif mark_key == 'em'
                  text = "<em>#{text}</em>"
                end
              end
            end
            content += text
          end 

          style = block['style'] || 'normal'
          
          if is_list_item
            html += "  <li>#{content}</li>\n"
          else
            tag = case style
                  when 'h1' then 'h1'
                  when 'h2' then 'h2'
                  when 'h3' then 'h3'
                  when 'blockquote' then 'blockquote'
                  else 'p'
                  end
            if tag == 'blockquote'
              html += "<blockquote><p>#{content}</p></blockquote>\n"
            else
              html += "<#{tag}>#{content}</#{tag}>\n"
            end
          end
          
        elsif block['_type'] == 'image'
          if list_open
             html += "</ul>\n"
             list_open = false
          end
          if block['asset'] && block['asset']['url']
            img_url = block['asset']['url']
            html += "<img src='#{img_url}' alt='Hình ảnh trong bài' class='img-fluid rounded my-3'>\n"
          end
        else
          if list_open
             html += "</ul>\n"
             list_open = false
          end
        end
        
        if index == blocks.length - 1 && list_open
          html += "</ul>\n"
        end
      end
      html
    end
  end
end

Liquid::Template.register_filter(Jekyll::SanityFilter)

# --- PHẦN 2: FETCH DATA VÀ TẠO FILE BÀI VIẾT ẢO ---
Jekyll::Hooks.register :site, :after_init do |site|
  token = ENV['SANITY_API_TOKEN']
  unless token
    puts "Bỏ qua fetch Sanity: không tìm thấy SANITY_API_TOKEN."
    next
  end

  puts "Fetching data from Sanity.io..."
  project_id = '7psj6s2s'
  dataset = 'production'
  query = <<~GROQ
    *[_type == "post"] { 
      title, slug, publishedAt, 
      "author": author->name, "image": mainImage.asset->url,
      description,
      body[] {
        ...,
        _type == "image" => { asset->{url} }, 
        markDefs[] { ..., _type == "link" => { "href": href } }
      }
    } | order(publishedAt desc)
  GROQ
  url = "https://#{project_id}.api.sanity.io/v1/data/query/#{dataset}?query=#{CGI.escape(query)}"
  response = HTTParty.get(url, headers: { 'Authorization' => "Bearer #{token}" })

  if response.success?
    posts = JSON.parse(response.body)['result']
    posts_dir = File.join(site.source, '_posts')
    FileUtils.mkdir_p(posts_dir)

    posts.each do |post|
      next unless post['slug'] && post['slug']['current'] && post['publishedAt']
      
      slug = post['slug']['current']
      date = Time.parse(post['publishedAt']).strftime('%Y-%m-%d')
      filename = "#{date}-#{slug}.md"
      path = File.join(posts_dir, filename)

      json_string = (post['body'] || []).to_json
      
      # =================================================================
      # === [[THAY ĐỔI QUAN TRỌNG NHẤT LÀ Ở ĐÂY]] ===
      # Chúng ta sẽ dùng cú pháp `|` của YAML để lưu body_json như một
      # khối văn bản nhiều dòng, đảm bảo nó luôn là một chuỗi JSON hợp lệ.
      # =================================================================
      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{post['publishedAt']}
        author: #{post['author'] ? post['author'].inspect : '"Việt Sáng Home"'}
        image: #{post['image'].inspect if post['image']}
        description: #{post['description'].inspect if post['description']}
        body_json: |
          #{json_string}
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