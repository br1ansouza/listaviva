class PurgeExpiredListsJob < ApplicationJob
  queue_as :default

  RETENTION = 90.days

  def perform
    List.where(expires_at: ...RETENTION.ago).find_each(&:destroy)
  end
end
