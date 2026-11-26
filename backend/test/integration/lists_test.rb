require "test_helper"

class ListsTest < ActionDispatch::IntegrationTest
  setup do
    @creator = new_device
    @attributes = { title: "Churras", list_type: "event", icon: "party", color: "blush" }
  end

  test "cria uma lista sem link de compartilhamento" do
    post api_lists_path, params: { list: @attributes }, headers: api_headers(@creator), as: :json

    assert_response :created
    assert_nil json["share_token"]
    assert json["is_creator"]
  end

  test "historico traz so as listas do proprio dispositivo, favoritas primeiro" do
    create_list(@creator, title: "Comum")
    create_list(@creator, title: "Favorita", favorite: true)
    create_list(new_device, title: "De outra pessoa")

    get mine_api_lists_path, headers: api_headers(@creator)

    assert_equal %w[Favorita Comum], json.pluck("title")
  end

  test "compartilhar gera link com a validade pedida" do
    list = create_list(@creator)

    post share_api_list_path(list), params: { expires_in: "1w" }, headers: api_headers(@creator), as: :json

    assert_response :success
    assert_includes json["share_url"], "/l/#{json["share_token"]}"
    assert_in_delta 1.week.from_now, Time.zone.parse(json["expires_at"]), 5.seconds
  end

  test "recusa validade desconhecida" do
    post share_api_list_path(create_list(@creator)), params: { expires_in: "1y" },
      headers: api_headers(@creator), as: :json

    assert_response :unprocessable_content
    assert_equal "validade_invalida", json["error"]
  end

  test "abre a lista compartilhada pelo token no cabecalho" do
    list = create_shared_list(@creator)

    get shared_api_lists_path, headers: api_headers(new_device, token: list.share_token)

    assert_response :success
    assert_equal list.id, json["id"]
  end

  test "sem token nao devolve lista nenhuma" do
    create_list(@creator)

    get shared_api_lists_path, headers: api_headers(new_device)
    assert_response :not_found

    get shared_api_lists_path, headers: api_headers(new_device, token: "inexistente")
    assert_response :not_found
  end

  test "link vencido responde 410 ao visitante e 200 ao criador" do
    list = create_shared_list(@creator, expires_at: 1.minute.ago)

    get shared_api_lists_path, headers: api_headers(new_device, token: list.share_token)
    assert_response :gone
    assert_equal "expirada", json["error"]

    get shared_api_lists_path, headers: api_headers(@creator, token: list.share_token)
    assert_response :success
  end

  test "na cota, oferece a lista mais antiga e nao cria nada" do
    oldest = fill_quota

    assert_no_difference -> { List.created_by(@creator).count } do
      post api_lists_path, params: { list: @attributes }, headers: api_headers(@creator), as: :json
    end

    assert_response :conflict
    assert_equal "limite_de_listas", json["error"]
    assert_equal oldest.id, json.dig("oldest_list", "id")
  end

  test "substitui a mais antiga quando id e versao conferem" do
    oldest = fill_quota

    post api_lists_path,
      params: { list: @attributes, replace_list_id: oldest.id, replace_list_version: oldest.updated_at.iso8601(6) },
      headers: api_headers(@creator), as: :json

    assert_response :created
    assert_not List.exists?(oldest.id)
    assert_equal List::DEVICE_LIMIT, List.created_by(@creator).count
  end

  test "nao substitui com versao antiga nem lista que nao e a mais antiga" do
    oldest = fill_quota
    newest = List.created_by(@creator).order(:created_at).last

    post api_lists_path,
      params: { list: @attributes, replace_list_id: oldest.id, replace_list_version: 1.day.ago.iso8601(6) },
      headers: api_headers(@creator), as: :json
    assert_response :conflict

    post api_lists_path,
      params: { list: @attributes, replace_list_id: newest.id, replace_list_version: newest.updated_at.iso8601(6) },
      headers: api_headers(@creator), as: :json
    assert_response :conflict

    assert List.exists?(oldest.id)
    assert List.exists?(newest.id)
  end

  test "lista nova invalida nao apaga a antiga" do
    oldest = fill_quota

    post api_lists_path,
      params: { list: @attributes.merge(title: ""), replace_list_id: oldest.id, replace_list_version: oldest.updated_at.iso8601(6) },
      headers: api_headers(@creator), as: :json

    assert_response :unprocessable_content
    assert List.exists?(oldest.id)
  end

  private

  def fill_quota
    now = Time.current
    rows = List::DEVICE_LIMIT.times.map do |index|
      { title: "Lista #{index}", list_type: "todo", icon: "list-todo", color: "sky", creator_device_id: @creator,
        created_at: now - (List::DEVICE_LIMIT - index).minutes, updated_at: now - (List::DEVICE_LIMIT - index).minutes }
    end
    List.insert_all!(rows)
    List.created_by(@creator).order(:created_at).first
  end
end
