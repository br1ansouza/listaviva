module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :client_id
    attr_reader :device_id, :share_token

    def connect
      @device_id = request.params[:device_id].presence
      @share_token = request.params[:share_token].presence

      reject_unauthorized_connection unless DeviceIdentity.valid?(device_id)
      self.client_id = SecureRandom.uuid
    end
  end
end
