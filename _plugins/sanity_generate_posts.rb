# _plugins/sanity_generate_posts.rb
require 'fileutils'

module Jekyll
  class SanityPostGenerator < Generator
    safe true
    priority :high

    def generate(site)
      return unless ENV['SANITY_API_TOKEN']
      return unless File.exist?('_data/sanity_posts.json')

      posts = JSON.parse(File.read('_data/sanity_posts.json'))
      dir = 'tin-tuc'

      FileUtils.mkdir_p(dir)

      posts.each do |post|
        slug = post['slug']['current']
        next unless slug

        path = File.join(dir, "#{slug}.html")

        File.write(path, <<~LIQUID)
          ---
          layout: post
          title: #{post['title'].inspect}
          publishedAt: #{post['publishedAt']}
          author: #{post['author'].inspect}
          image: #{post['image'].inspect}
          body: #{post['body'].to_json}
          ---
        LIQUID
      end
    end
  end
end