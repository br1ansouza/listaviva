ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ListHelpers
  def new_device
    SecureRandom.uuid
  end

  def create_list(device, **attributes)
    List.create!(
      { title: "Mercado", list_type: "shopping", icon: "shopping-cart", color: "mint", creator_device_id: device }
        .merge(attributes)
    )
  end

  def create_shared_list(device, expires_at: 1.day.from_now)
    create_list(device, share_token: SecureRandom.urlsafe_base64(16), expires_at: expires_at)
  end

  def api_headers(device, token: nil, name: nil)
    headers = { "X-Device-Id" => device }
    headers["X-Share-Token"] = token if token
    headers["X-Device-Name"] = CGI.escape(name) if name
    headers
  end

  def json
    response.parsed_body
  end
end

class ActiveSupport::TestCase
  include ListHelpers
end
