module ListAccess
  extend ActiveSupport::Concern

  private

  def authorize_access!(list)
    return if list.accessible_with?(device_id: device_id, share_token: share_token)

    render_error(:forbidden, "sem_acesso")
  end
end
