# _plugins/sanity.rb

require 'httparty'
require 'json'
require 'fileutils'
require 'time'
require 'cgi' 

module Jekyll
  module SanityFilter
    def portable_text_to_html(input)
      # === BƯỚC 1: KIỂM TRA ĐẦU VÀO ===
      return "" if input.nil? || input.empty?

      begin
        # Xử lý input linh hoạt, có thể là JSON string hoặc đã là mảng Ruby
        blocks = input.is_a?(String) ? JSON.parse(input) : input
      rescue JSON::ParserError
        return "<p>Lỗi: Không thể render nội dung bài viết.</p>"
      end

      return "" unless blocks.is_a?(Array)
      
      # "Bình thường hóa" dữ liệu để đảm bảo tất cả key là dạng chuỗi, tránh lỗi
      blocks = JSON.parse(blocks.to_json)

      # === BƯỚC 2: XÂY DỰNG CHUỖI HTML ===
      html = ""
      list_open = false # Biến để theo dõi thẻ <ul> đang mở hay đóng

      blocks.each_with_index do |block, index|
        # --- Tối ưu logic xử lý danh sách (list) ---
        is_list_item = block['listItem'] == 'bullet'
        
        # Mở thẻ <ul> nếu đây là list item đầu tiên
        if is_list_item && !list_open
          html += "<ul>\n"
          list_open = true
        # Đóng thẻ <ul> nếu khối hiện tại không phải là list item nữa
        elsif !is_list_item && list_open
          html += "</ul>\n"
          list_open = false
        end

        # --- Xử lý từng loại khối (block) ---
        case block['_type']
        when 'block'
          next unless block['children']
          
          # Dịch các đoạn text nhỏ (span) thành HTML
          content = ""
          block['children'].each do |child|
            next unless child['_type'] == 'span' && child['text']
            text = CGI.escapeHTML(child['text']) 
            
            # Áp dụng các định dạng (in đậm, link,...)
            (child['marks'] || []).reverse.each do |mark_key|
              if mark_def = block['markDefs']&.find { |md| md['_key'] == mark_key }
                if mark_def['_type'] == 'link'
                  text = "<a href='#{CGI.escapeHTML(mark_def['href'])}' target='_blank' rel='noopener noreferrer'>#{text}</a>"
                end
              else
                case mark_key
                when 'strong' then text = "<strong>#{text}</strong>"
                when 'em' then text = "<em>#{text}</em>"
                when 'underline' then text = "<u>#{text}</u>"
                when 'strike-through' then text = "<s>#{text}</s>"
                end
              end
            end
            content += text
          end 

          # Bọc content bằng các thẻ block tương ứng (p, h3, h4,...)
          if is_list_item
            html += "  <li>#{content}</li>\n"
          else
            style = block['style'] || 'normal'
            # === THÊM HỖ TRỢ CHO H4, H5, H6 ===
            tag = case style
                  when 'h1' then 'h1'
                  when 'h2' then 'h2'
                  when 'h3' then 'h3'
                  when 'h4' then 'h4'
                  when 'h5' then 'h5'
                  when 'h6' then 'h6'
                  when 'blockquote' then 'blockquote'
                  else 'p'
                  end
            
            if tag == 'blockquote'
              html += "<blockquote><p>#{content}</p></blockquote>\n"
            else
              html += "<#{tag}>#{content}</#{tag}>\n"
            end
          end
          
        when 'image'
          if block['asset'] && block['asset']['url']
            img_url = block['asset']['url']
            # Lấy alt text từ Sanity, nếu không có thì để trống
            alt_text = CGI.escapeHTML(block['alt'] || "")
            # Lấy chú thích (nếu bạn có một trường riêng cho nó, ví dụ: 'caption')
            # Nếu không, bạn có thể dùng chung alt_text hoặc bỏ trống <figcaption>
            caption_text = alt_text # Dùng chung alt text làm caption luôn

            html += "<figure class='my-4 text-center'>"
            html += "  <img src='#{img_url}' alt='#{alt_text}' class='img-fluid rounded shadow-sm' loading='lazy'>"
            if caption_text && !caption_text.empty?
              html += "  <figcaption class='mt-2 text-muted small'>#{caption_text}</figcaption>"
            end
            html += "</figure>\n"
          end
        end
      end

      # Đảm bảo thẻ <ul> được đóng ở cuối nếu bài viết kết thúc bằng một danh sách
      html += "</ul>\n" if list_open

      return html
    end
  end
end

Liquid::Template.register_filter(Jekyll::SanityFilter)

# PHẦN 2: FETCH DATA - DÙNG LẠI PHIÊN BẢN GHI `body_json` VỚI `|` ĐỂ TRÁNH LỖI YAML
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
      "author": author->name, 
      "image": mainImage.asset->url,
      "tags": categories[]->title,
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
      
      content = <<~MARKDOWN
        ---
        layout: post
        title: #{post['title'].inspect}
        date: #{post['publishedAt']}
        author: #{post['author'] ? post['author'].inspect : '"Việt Sáng Home"'}
        image: #{post['image'].inspect if post['image']}
        tags: [#{ (post['tags'] || []).map(&:inspect).join(', ') }]
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