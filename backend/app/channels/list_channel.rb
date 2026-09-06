class ListChannel < ApplicationCable::Channel
  def subscribed
    list = List.find_by(id: params[:list_id])

    return reject unless list&.accessible_with?(device_id: device_id, share_token: share_token)

    stream_from list.channel_name
  end
end
