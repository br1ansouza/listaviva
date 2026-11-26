require "test_helper"

class ListAccessTest < ActionDispatch::IntegrationTest
  setup do
    @creator = new_device
    @visitor = new_device
    @list = create_shared_list(@creator)
    @item = @list.list_items.create!(content: "Carvão", created_by_device_id: @creator, updated_by_device_id: @creator)
  end

  test "exige um device id valido" do
    get api_list_path(@list)
    assert_response :bad_request

    get api_list_path(@list), headers: { "X-Device-Id" => "nao-e-uuid" }
    assert_response :bad_request
  end

  test "criador le a lista sem token" do
    get api_list_path(@list), headers: api_headers(@creator)

    assert_response :success
    assert json["is_creator"]
    assert_equal [ "Carvão" ], json["items"].pluck("content")
  end

  test "visitante com token le e edita itens" do
    headers = api_headers(@visitor, token: @list.share_token, name: "Ana")

    get api_list_path(@list), headers: headers
    assert_response :success
    assert_not json["is_creator"]

    post api_list_items_path(@list), params: { item: { content: "Gelo" } }, headers: headers, as: :json
    assert_response :created
    assert_equal "Ana", json["created_by_name"]

    patch api_list_item_path(@list, @item), params: { item: { done: true } }, headers: headers, as: :json
    assert_response :success
    assert json["done"]

    delete api_list_item_path(@list, @item), headers: headers
    assert_response :no_content
  end

  test "sem token, com token errado ou com link vencido a lista nao existe" do
    get api_list_path(@list), headers: api_headers(@visitor)
    assert_response :not_found

    get api_list_path(@list), headers: api_headers(@visitor, token: "token-errado")
    assert_response :not_found

    @list.update!(expires_at: 1.minute.ago)
    post api_list_items_path(@list), params: { item: { content: "Gelo" } },
      headers: api_headers(@visitor, token: @list.share_token), as: :json
    assert_response :not_found
    assert_equal 1, @list.list_items.count
  end

  test "so o criador personaliza e compartilha" do
    headers = api_headers(@visitor, token: @list.share_token)

    patch api_list_path(@list), params: { list: { title: "Novo nome" } }, headers: headers, as: :json
    assert_response :success

    patch api_list_path(@list), params: { list: { color: "coral" } }, headers: headers, as: :json
    assert_response :forbidden

    post share_api_list_path(@list), params: { expires_in: "1d" }, headers: headers, as: :json
    assert_response :forbidden
  end

  test "respostas nunca expoem o device id de ninguem" do
    get api_list_path(@list), headers: api_headers(@visitor, token: @list.share_token)

    assert_not_includes response.body, @creator
    assert_not_includes response.body, @visitor
    assert_not_equal json["participant_id"], json["items"].first["created_by_id"]
  end

  test "o id publico de autoria muda de uma lista para outra" do
    other = create_list(@creator)

    get api_list_path(@list), headers: api_headers(@creator)
    here = json["participant_id"]
    get api_list_path(other), headers: api_headers(@creator)

    assert_not_equal here, json["participant_id"]
  end
end
