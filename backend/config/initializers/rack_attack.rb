Rack::Attack.throttle("lists/create", limit: 30, period: 1.hour) do |request|
  request.ip if request.post? && request.path == "/api/lists"
end

Rack::Attack.throttle("lists/share", limit: 60, period: 1.hour) do |request|
  request.ip if request.post? && request.path.match?(%r{\A/api/lists/[^/]+/share\z})
end

Rack::Attack.throttle("api/geral", limit: 600, period: 5.minutes) do |request|
  request.ip if request.path.start_with?("/api/")
end

Rack::Attack.throttled_responder = lambda do |_request|
  [ 429, { "Content-Type" => "application/json" }, [ { error: "muitas_requisicoes" }.to_json ] ]
end

Rack::Attack.enabled = !Rails.env.test?
