require "test_helper"

class ListTest < ActiveSupport::TestCase
  setup do
    @creator = new_device
    @visitor = new_device
  end

  test "criador acessa mesmo sem link e com link vencido" do
    assert create_list(@creator).accessible_with?(device_id: @creator, share_token: nil)
    assert create_shared_list(@creator, expires_at: 1.hour.ago).accessible_with?(device_id: @creator, share_token: nil)
  end

  test "visitante precisa do token exato de um link ainda valido" do
    list = create_shared_list(@creator)

    assert list.accessible_with?(device_id: @visitor, share_token: list.share_token)
    assert_not list.accessible_with?(device_id: @visitor, share_token: "outro-token")
    assert_not list.accessible_with?(device_id: @visitor, share_token: nil)
  end

  test "visitante perde o acesso quando o link vence" do
    list = create_shared_list(@creator, expires_at: 1.minute.ago)

    assert_not list.accessible_with?(device_id: @visitor, share_token: list.share_token)
  end

  test "lista nunca compartilhada nao aceita token vazio" do
    assert_not create_list(@creator).accessible_with?(device_id: @visitor, share_token: "")
  end

  test "compartilhar de novo troca o token" do
    list = create_shared_list(@creator)
    old_token = list.share_token

    list.share!("8h")

    assert_not_equal old_token, list.share_token
    assert_in_delta 8.hours.from_now, list.expires_at, 5.seconds
    assert_not list.accessible_with?(device_id: @visitor, share_token: old_token)
  end
end
