require "test_helper"

class ListItemTest < ActiveSupport::TestCase
  setup do
    @list = create_list(new_device)
  end

  test "normaliza espacos do conteudo" do
    item = @list.list_items.create!(content: "  pao   de  alho ")

    assert_equal "pao de alho", item.content
  end

  test "posiciona cada item novo no fim" do
    first = @list.list_items.create!(content: "um")
    second = @list.list_items.create!(content: "dois")

    assert_equal [ 1, 2 ], [ first.position, second.position ]
  end

  test "recusa conteudo repetido ignorando caixa e espacos" do
    @list.list_items.create!(content: "Carvão")
    repeated = @list.list_items.build(content: "  carvão ")

    assert_not repeated.valid?
    assert repeated.errors.of_kind?(:content, :taken)
  end

  test "aceita o mesmo conteudo em listas diferentes" do
    @list.list_items.create!(content: "Carvão")

    assert create_list(new_device).list_items.build(content: "Carvão").valid?
  end

  test "valida quantidade e preco das compras" do
    assert @list.list_items.build(content: "a", metadata: { "quantity_millis" => 1500, "unit_price_cents" => 8990 }).valid?
    assert @list.list_items.build(content: "b", metadata: { "quantity_millis" => 1000, "unit_price_cents" => nil }).valid?
    assert_not @list.list_items.build(content: "c", metadata: { "quantity_millis" => 0 }).valid?
    assert_not @list.list_items.build(content: "d", metadata: { "quantity_millis" => 1.5 }).valid?
    assert_not @list.list_items.build(content: "e", metadata: { "unit_price_cents" => -1 }).valid?
  end

  test "limita o tamanho dos metadados" do
    assert_not @list.list_items.build(content: "a", metadata: { "nota" => "x" * ListItem::METADATA_BYTE_LIMIT }).valid?
  end
end
