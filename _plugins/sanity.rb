# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'
require 'cgi' # Dùng để escape HTML

# --- PHẦN 1: LIQUID FILTER ĐỂ RENDER PORTABLE TEXT (NÂNG CẤP) ---
module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      return "" if input.nil? || input.empty?

      begin
        blocks = input.is_a?(Array) ? input : JSON.parse(input)
      rescue JSON::ParserError => e
        puts "Lỗi JSON Parse trong portable_text_to_html: #{e.message}"
        return "<p>Lỗi render nội dung.</p>"
      end

      return "" unless blocks.is_a?(Array)

      html = ""
      # Biến để xử lý logic đóng/mở thẻ <ul>
      list_open = false 

      blocks.each_with_index do |block, index|
        
        # --- Xử lý block kiểu 'block' (text, headings, list) ---
        if block['_type'] == 'block' && block['children']
          
          # --- Xử lý danh sách (List) ---
          is_list_item = block['listItem'] == 'bullet' # Bạn có thể thêm 'number'
          
          # Mở thẻ <ul> nếu đây là item đầu tiên của list
          if is_list_item && !list_open
            html += "<ul>\n"
            list_open = true
          end
          
          # Đóng thẻ </ul> nếu item này không phải list, hoặc là block cuối cùng
          if !is_list_item && list_open
             html += "</ul>\n"
             list_open = false
          end

          # --- Xử lý children (spans) ---
          content = ""
          block['children'].each do |child|
            next unless child['_type'] == 'span' && child['text']
            
            text = CGI.escapeHTML(child['text']) # Chống XSS
            
            # Xử lý marks (bold, italic, links)
            if child['marks']&.any?
              (child['marks'] || []).reverse.each do |mark_key|
                # Kiểm tra xem mark_key có trong markDefs không (cho links)
                if mark = block['markDefs']&.find { |md| md['_key'] == mark_key }
                  if mark['_type'] == 'link'
                    text = "<a href='#{CGI.escapeHTML(mark['href'])}' target='_blank' rel='noopener noreferrer'>#{text}</a>"
                  end
                # Xử lý marks đơn giản (strong, em)
                elsif mark_key == 'strong'
                  text = "<strong>#{text}</strong>"
                elsif mark_key == 'em'
                  text = "<em>#{text}</em>"
                end
              end
            end
            content += text
          end # end children.each

          # --- Render HTML dựa trên style ---
          style = block['style'] || 'normal'
          
          if is_list_item
            html += "  <li>#{content}</li>\n"
          else
            case style
            when 'h1' then html += "<h1>#{content}</h1>\n"
            when 'h2' then html += "<h2>#{content}</h2>\n"
            when 'h3' then html += "<h3>#{content}</h3>\n"
            when 'blockquote' then html += "<blockquote><p>#{content}</p></blockquote>\n"
            else html += "<p>#{content}</p>\n"
            end
          end
          
        # --- Xử lý block kiểu 'image' (nếu có) ---
        elsif block['_type'] == 'image' && block['asset']
          # TODO: Bạn cần query URL của ảnh trong GROQ
          # Ví dụ: body[] { ..., asset->{url} }
          # Giả sử đã có URL: img_url = block['asset']['url']
          # html += "<img src='#{img_url}' alt='Nội dung ảnh' class='img-fluid rounded my-3'>\n"
          
          # Đóng thẻ list nếu đang mở
          if list_open
             html += "</ul>\n"
             list_open = false
          end
          html += "<p><em>[Render ảnh ở đây]</em></p>\n"
          
        # Xử lý các block không xác định
        else
          # Đóng thẻ list nếu đang mở
          if list_open
             html += "</ul>\n"
             list_open = false
          end
        end # end if block['_type']
        
        # Đóng thẻ <ul> nếu đây là block cuối cùng VÀ đang là list
        if index == blocks.length - 1 && list_open
          html += "</ul>\n"
        end
        
      end # end blocks.each
      
      html
    end
  end
end

Liquid::Template.register_filter(Jekyll::SanityFilter)

# --- PHẦN 2: FETCH DATA VÀ TẠO FILE BÀI VIẾT ẢO (CẬP NHẬT) ---
Jekyll::Hooks.register :site, :after_init do |site|
  token = ENV['SANITY_API_TOKEN']
  unless token
    puts "Bỏ qua fetch Sanity: không tìm thấy SANITY_API_TOKEN."
    next
  end

  puts "Fetching data from Sanity.io..."

  project_id = '7psj6s2s' # Thay project_id của bạn
  dataset = 'production'  # Thay dataset của bạn

  # CẬP NHẬT QUERY: Thêm 'description' (cho SEO)
  # Và 'markDefs' trong 'body' (cho links)
  query = <<~GROQ
    *[_type == "post"] { 
      title, 
      slug, 
      publishedAt, 
      "author": author->name, 
      "image": mainImage.asset->url,
      description,
      body[] {
        ...,
        markDefs[] {
          ...,
          _type == "link" => { "href": href }
        }
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
      next unless post['slug'] && post['slug']['current']
      unless post['publishedAt']
          puts "Bỏ qua post '#{post['title']}' vì không có publishedAt."
          next
      end

      slug = post['slug']['current']
      date_str = post['publishedAt']
      date = Time.parse(date_str).strftime('%Y-%m-%d')
      filename = "#{date}-#{slug}.md"
      path = File.join(posts_dir, filename)

      json_string = (post['body'] || []).to_json

      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{date_str}
        author: #{post['author'] ? post['author'].inspect : '"Việt Sáng Home"'}
        image: #{post['image'].inspect if post['image']}

        # CẬP NHẬT: Thêm description cho jekyll-seo-tag
        description: #{post['description'].inspect if post['description']}
        
        # Dùng .inspect để escape chuỗi JSON cho YAML
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