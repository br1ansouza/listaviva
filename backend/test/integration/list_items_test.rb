require "test_helper"

class ListItemsTest < ActionDispatch::IntegrationTest
  setup do
    @creator = new_device
    @list = create_list(@creator)
    @headers = api_headers(@creator, name: "Brian")
  end

  test "recusa item repetido" do
    add("Carvão")

    post api_list_items_path(@list), params: { item: { content: " carvão " } }, headers: @headers, as: :json

    assert_response :unprocessable_content
    assert_equal "item_duplicado", json["error"]
  end

  test "recusa o item que passaria do limite da lista" do
    now = Time.current
    ListItem.insert_all!(ListItem::PER_LIST_LIMIT.times.map { |index|
      { list_id: @list.id, content: "item #{index}", position: index + 1, created_at: now, updated_at: now }
    })

    post api_list_items_path(@list), params: { item: { content: "um a mais" } }, headers: @headers, as: :json

    assert_response :unprocessable_content
    assert_equal "limite_de_itens", json["error"]
  end

  test "atualizar metadados preserva os campos nao enviados" do
    item = add("Picanha", metadata: { "quantity_millis" => 1500, "unit_price_cents" => 8990 })

    patch api_list_item_path(@list, item), params: { item: { metadata: { unit_price_cents: 7990 } } },
      headers: @headers, as: :json

    assert_response :success
    assert_equal({ "quantity_millis" => 1500, "unit_price_cents" => 7990 }, json["metadata"])
  end

  test "registra quem editou por ultimo" do
    item = add("Gelo")
    @list.share!("1d")

    patch api_list_item_path(@list, item), params: { item: { done: true } },
      headers: api_headers(new_device, token: @list.share_token, name: "Léo"), as: :json

    assert_equal "Brian", json["created_by_name"]
    assert_equal "Léo", json["updated_by_name"]
    assert_not_equal json["created_by_id"], json["updated_by_id"]
  end

  test "move um item para antes de outro" do
    a, b, c = add("a"), add("b"), add("c")

    post move_api_list_item_path(@list, c), params: { before_id: a.id }, headers: @headers, as: :json

    assert_response :success
    assert_equal [ c.id, a.id, b.id ], json["order"]
    assert_equal %w[c a b], @list.list_items.reload.map(&:content)
    assert_equal [ 1, 2, 3 ], @list.list_items.map(&:position)
  end

  test "move um item para o fim com before_id nulo" do
    a, b, c = add("a"), add("b"), add("c")

    post move_api_list_item_path(@list, a), params: { before_id: nil }, headers: @headers, as: :json

    assert_equal [ b.id, c.id, a.id ], json["order"]
  end

  test "move para cima e para baixo sem sair das bordas" do
    a, b = add("a"), add("b")

    post move_api_list_item_path(@list, b), params: { direction: "up" }, headers: @headers, as: :json
    assert_equal [ b.id, a.id ], json["order"]

    post move_api_list_item_path(@list, b), params: { direction: "up" }, headers: @headers, as: :json
    assert_equal [ b.id, a.id ], json["order"]
  end

  test "recusa destino de outra lista e direcao desconhecida" do
    item = add("a")
    foreign = create_list(@creator).list_items.create!(content: "de fora")

    post move_api_list_item_path(@list, item), params: { before_id: foreign.id }, headers: @headers, as: :json
    assert_response :unprocessable_content
    assert_equal "destino_invalido", json["error"]

    post move_api_list_item_path(@list, item), params: { direction: "sideways" }, headers: @headers, as: :json
    assert_response :unprocessable_content
    assert_equal "direcao_invalida", json["error"]
  end

  test "item de outra lista nao e alcancado por esta rota" do
    foreign = create_list(@creator).list_items.create!(content: "de fora")

    delete api_list_item_path(@list, foreign), headers: @headers

    assert_response :not_found
    assert ListItem.exists?(foreign.id)
  end

  private

  def add(content, **attributes)
    @list.list_items.create!({ content: content, created_by_device_id: @creator, created_by_name: "Brian" }.merge(attributes))
  end
end
