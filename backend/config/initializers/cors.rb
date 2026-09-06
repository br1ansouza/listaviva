LOCAL_ORIGINS = %r{\Ahttp://(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)(:\d+)?\z}

configured_origins = ENV.fetch("FRONTEND_URL", "").split(",").map { |origin| origin.strip.chomp("/") }.reject(&:empty?)
allowed_origins = Rails.env.production? ? configured_origins : configured_origins + [ LOCAL_ORIGINS ]

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [ :get, :post, :patch, :put, :delete, :options, :head ],
      max_age: 600
  end
end
