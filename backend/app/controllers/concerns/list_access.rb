module ListAccess
  extend ActiveSupport::Concern

  private

  def authorized_for?(list)
    return true if list.created_by?(device_id)
    return false unless list.shared? && !list.expired?

    ActiveSupport::SecurityUtils.secure_compare(list.share_token, share_token.to_s)
  end

  def authorize_access!(list)
    render_error(:forbidden, "sem_acesso") unless authorized_for?(list)
  end
end
