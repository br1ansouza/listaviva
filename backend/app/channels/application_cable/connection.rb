module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :device_id, :share_token

    def connect
      self.device_id = request.params[:device_id].presence
      self.share_token = request.params[:share_token].presence

      reject_unauthorized_connection if device_id.blank?
    end
  end
end
