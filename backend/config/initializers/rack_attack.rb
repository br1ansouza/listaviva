Rack::Attack.throttle("lists/create", limit: 60, period: 1.hour) do |request|
  request.get_header("action_dispatch.remote_ip").to_s if request.post? && request.path.match?(%r{\A/api/lists(?:\.[^/]+)?/?\z})
end

Rack::Attack.throttle("lists/share", limit: 60, period: 1.hour) do |request|
  request.get_header("action_dispatch.remote_ip").to_s if request.post? && request.path.match?(%r{\A/api/lists/[^/]+/share(?:\.[^/]+)?/?\z})
end

Rack::Attack.throttle("api/geral", limit: 600, period: 5.minutes) do |request|
  request.get_header("action_dispatch.remote_ip").to_s if request.path.start_with?("/api/")
end

Rack::Attack.throttle("cable/connect", limit: 60, period: 1.minute) do |request|
  request.get_header("action_dispatch.remote_ip").to_s if request.path.match?(%r{\A/cable/?\z})
end

Rack::Attack.throttled_responder = lambda do |request|
  period = request.env.fetch("rack.attack.match_data").fetch(:period)
  retry_after = period - Time.now.to_i % period
  [ 429, { "content-type" => "application/json", "cache-control" => "no-store", "retry-after" => retry_after.to_s }, [ { error: "muitas_requisicoes" }.to_json ] ]
end

Rack::Attack.enabled = !Rails.env.test?
