require "test_helper"

class PurgeExpiredListsJobTest < ActiveJob::TestCase
  setup do
    @creator = new_device
  end

  test "apaga lista com link vencido e parada alem da retencao" do
    list = stale_list(expired: 91.days.ago, touched: 91.days.ago)
    list.list_items.create!(content: "Carvão")
    list.update_columns(updated_at: 91.days.ago)

    PurgeExpiredListsJob.perform_now

    assert_not List.exists?(list.id)
    assert_equal 0, ListItem.where(list_id: list.id).count
  end

  test "mantem lista vencida que continua em uso pelo criador" do
    list = stale_list(expired: 91.days.ago, touched: 1.day.ago)

    PurgeExpiredListsJob.perform_now

    assert List.exists?(list.id)
  end

  test "mantem lista vencida ha menos tempo que a retencao" do
    list = stale_list(expired: 89.days.ago, touched: 89.days.ago)

    PurgeExpiredListsJob.perform_now

    assert List.exists?(list.id)
  end

  test "nunca apaga lista que nao foi compartilhada" do
    list = create_list(@creator)
    list.update_columns(updated_at: 1.year.ago)

    PurgeExpiredListsJob.perform_now

    assert List.exists?(list.id)
  end

  private

  def stale_list(expired:, touched:)
    create_shared_list(@creator, expires_at: expired).tap { |list| list.update_columns(updated_at: touched) }
  end
end
