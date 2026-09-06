module DeviceIdentity
  FORMAT = /\A[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

  module_function

  def valid?(value)
    value.is_a?(String) && FORMAT.match?(value)
  end
end
