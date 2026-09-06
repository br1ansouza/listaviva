class PruneCableMessagesJob < ApplicationJob
  queue_as :default

  RETENTION = 1.hour

  def perform
    SolidCable::Message.where(created_at: ...RETENTION.ago).delete_all
  end
end
