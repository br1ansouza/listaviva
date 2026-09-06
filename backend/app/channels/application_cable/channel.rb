module ApplicationCable
  class Channel < ActionCable::Channel::Base
    delegate :device_id, :share_token, to: :connection
  end
end
