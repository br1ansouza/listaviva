require "test_helper"

class RequestLimitsTest < ActionDispatch::IntegrationTest
  setup do
    @creator = new_device
    @list = create_list(@creator)
    @headers = api_headers(@creator).merge("Content-Type" => "application/json")
    @oversized = { item: { content: "a" * RequestLimits::MAX_BODY_BYTES } }.to_json
  end

  test "recusa corpo acima do limite em qualquer metodo" do
    post api_list_items_path(@list), params: @oversized, headers: @headers
    assert_response :content_too_large

    delete api_list_item_path(@list, SecureRandom.uuid), params: @oversized, headers: @headers
    assert_response :content_too_large

    assert_equal "requisicao_muito_grande", json["error"]
    assert_equal 0, @list.list_items.count
  end

  test "aceita corpo dentro do limite" do
    post api_list_items_path(@list), params: { item: { content: "Gelo" } }.to_json, headers: @headers

    assert_response :created
  end
end
