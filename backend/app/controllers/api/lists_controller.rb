module Api
  class ListsController < ApplicationController
    include ListAccess

    PERSONALIZATION_FIELDS = %w[icon color list_type].freeze

    before_action :set_list, only: [ :show, :update, :share ]
    before_action :authorize_list_access!, only: [ :show, :update ]

    def create
      list, replaced = ListCreation.call(
        list_params,
        device_id: device_id,
        replacement_id: params[:replace_list_id],
        replacement_version: params[:replace_list_version],
      )
      ListBroadcaster.broadcast(replaced, "access_changed", { id: replaced.id }) if replaced

      render json: ListSerializer.call(list, device_id: device_id), status: :created
    rescue ListCreation::LimitReached => exception
      oldest = exception.oldest
      render json: {
        error: "limite_de_listas",
        limit: List::DEVICE_LIMIT,
        oldest_list: {
          id: oldest.id, title: oldest.title, created_at: oldest.created_at,
          items_count: oldest.list_items.count, version: oldest.updated_at.iso8601(6)
        }
      }, status: :conflict
    end

    def show
      render json: ListSerializer.call(@list, device_id: device_id)
    end

    def update
      if personalization_requested? && !@list.created_by?(device_id)
        return render_error(:forbidden, "somente_o_criador_personaliza")
      end

      @list.update!(list_params)
      ListBroadcaster.list_updated(@list)

      render json: ListSerializer.call(@list, device_id: device_id)
    end

    def mine
      lists = List.created_by(device_id).includes(:list_items).order(updated_at: :desc)

      render json: lists.map { |list| ListSerializer.summary(list, device_id: device_id) }
    end

    def share
      return render_error(:forbidden, "somente_o_criador_compartilha") unless @list.created_by?(device_id)

      duration = params.require(:expires_in)
      return render_error(:unprocessable_content, "validade_invalida") unless List::SHARE_DURATIONS.key?(duration)

      @list.share!(duration)
      ListBroadcaster.broadcast(@list, "access_changed", { id: @list.id })

      render json: ListSerializer.call(@list, device_id: device_id).merge(
        share_url: share_url_for(@list),
        whatsapp_url: whatsapp_url_for(@list)
      )
    end

    def by_token
      list = List.includes(:list_items).find_by!(share_token: params[:token])

      if list.expired? && !list.created_by?(device_id)
        return render json: { error: "expirada", expires_at: list.expires_at }, status: :gone
      end

      render json: ListSerializer.call(list, device_id: device_id)
    end

    private

    def set_list
      @list = List.includes(:list_items).find(params[:id])
    end

    def authorize_list_access!
      authorize_access!(@list)
    end

    def list_params
      params.expect(list: [ :title, :list_type, :icon, :color ])
    end

    def personalization_requested?
      list_params.keys.intersect?(PERSONALIZATION_FIELDS)
    end

    def share_url_for(list)
      "#{frontend_origin}/l/#{list.share_token}"
    end

    def whatsapp_url_for(list)
      message = "#{list.title} — nossa lista ao vivo no ListaViva: #{share_url_for(list)}"

      "https://wa.me/?text=#{CGI.escape(message)}"
    end

    def frontend_origin
      ENV.fetch("FRONTEND_URL", "http://localhost:5173").chomp("/")
    end
  end
end
