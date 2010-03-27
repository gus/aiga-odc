require 'rubygems'
require 'rake'
require 'pathname'

module ThumbleMonks

  class Tastic # Formerly Rake::Static

    def initialize(app, options={})
      @app = app
      @urls = options[:urls] || ["/favicon.ico"]
      root = options[:root] || Dir.pwd
      @file_server = Rack::File.new(root)
    end

    def call(env)
      path = env["PATH_INFO"]
      can_serve = @urls.any? { |url| path.index(url) == 0 }
      if can_serve
        response = process_static(env)
        response = static_with_index(env) if response.first == 404
        response
      else
        @app.call(env)
      end
    end

  private
    def process_static(env)
      @file_server.call(env)
    end

    def static_with_index(env)
      path_with_index = (Pathname(env["PATH_INFO"]) + "index.html").to_s
      env["PATH_INFO"] = path_with_index
      process_static(env)
    end

  end
end

task "rackme", :path, :port do |t,args|
  require 'rack'
  path = args[:path] || "example"
  port = (args[:port] || "8081").to_i
  Rack::Handler::Thin.run(Rack::Builder.app {
    map("/") {
      use(ThumbleMonks::Tastic, :urls => ["/"], :root => path)
      use(Rack::Lint)
    }
  }, :Port => port)
end
