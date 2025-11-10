# _data/sanity_posts.rb
require 'httparty'
require 'json'

# Chỉ chạy nếu có token (Netlify sẽ cung cấp)
return unless ENV['SANITY_API_TOKEN']

project_id = '7psj6s2s'
dataset = 'production'
token = ENV['SANITY_API_TOKEN']

# GROQ query: Lấy tất cả bài viết
query = '*[_type == "post"] { title, slug, publishedAt, "author": author->name, "image": mainImage.asset->url, body } | order(publishedAt desc)'

url = "https://#{project_id}.api.sanity.io/v1/data/query/#{dataset}?query=#{URI.encode(query)}"

response = HTTParty.get(url, headers: { 'Authorization' => "Bearer #{token}" })

if response.success?
  posts = JSON.parse(response.body)['result']
  File.write('_data/sanity_posts.json', posts.to_json)
else
  puts "Lỗi fetch Sanity: #{response.code}"
end