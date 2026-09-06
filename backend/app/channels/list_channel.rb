class ListChannel < ApplicationCable::Channel
  periodically :verify_access, every: 15.seconds

  def subscribed
    return reject unless DeviceIdentity.valid?(params[:list_id])

    @list_id = params[:list_id]
    list = List.find_by(id: @list_id)

    return reject unless list&.accessible_with?(device_id: device_id, share_token: share_token)

    stream_from list.channel_name, coder: ActiveSupport::JSON do |message|
      transmit(message) if verify_access
    end
  end

  private

  def verify_access
    return false if @revoked

    list = List.find_by(id: @list_id)
    return true if list&.accessible_with?(device_id: device_id, share_token: share_token)

    @revoked = true
    transmit({ event: "access_revoked", payload: {} })
    stop_all_streams
    stop_periodic_timers
    false
  end
end
