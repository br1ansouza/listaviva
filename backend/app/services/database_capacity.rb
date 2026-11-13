module DatabaseCapacity
  LIMIT_BYTES = 400.megabytes
  CHECK_INTERVAL = 60.seconds

  module_function

  def exceeded?
    Rails.cache.fetch("database_capacity/exceeded", expires_in: CHECK_INTERVAL) do
      current_bytes >= LIMIT_BYTES
    end
  end

  def current_bytes
    ActiveRecord::Base.connection.select_value("SELECT pg_database_size(current_database())").to_i
  end
end
