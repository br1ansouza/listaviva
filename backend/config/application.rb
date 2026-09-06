require_relative "boot"
require_relative "../lib/request_limits"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module Listaviva
  class Application < Rails::Application
    config.load_defaults 8.1

    config.autoload_lib(ignore: %w[assets tasks])

    config.api_only = true

    config.time_zone = "UTC"

    config.active_record.schema_format = :ruby

    config.middleware.insert_before Rails::Rack::Logger, RequestLimits
  end
end
