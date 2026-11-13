module Api
  class ListItemsController < ApplicationController
    include ListAccess

    rescue_from ActiveRecord::RecordNotUnique, with: :render_duplicate

    before_action :set_list
    before_action :authorize_list_access!
    before_action :set_item, only: [ :update, :destroy, :move ]

    def create
      item = @list.with_lock do
        authorize_access!(@list)
        return if performed?
        if @list.list_items.count >= ListItem::PER_LIST_LIMIT
          return render_error(:unprocessable_content, "limite_de_itens")
        end

        @list.list_items.create!(
          item_params.merge(
            created_by_device_id: device_id,
            updated_by_device_id: device_id,
            created_by_name: device_name,
            updated_by_name: device_name,
          ),
        )
      end
      ListBroadcaster.item_created(item)

      render json: ListItemSerializer.call(item), status: :created
    end

    def update
      @list.with_lock do
        authorize_access!(@list)
        return if performed?

        @item.reload
        attributes = item_params.to_h
        if attributes["metadata"].is_a?(Hash)
          previous_metadata = @item.metadata.is_a?(Hash) ? @item.metadata : {}
          attributes["metadata"] = previous_metadata.merge(attributes["metadata"])
        end
        @item.update!(attributes.merge(updated_by_device_id: device_id, updated_by_name: device_name))
      end
      ListBroadcaster.item_updated(@item)

      render json: ListItemSerializer.call(@item)
    end

    def destroy
      @list.with_lock do
        authorize_access!(@list)
        return if performed?

        @item.reload.destroy!
      end
      ListBroadcaster.item_destroyed(@item)

      head :no_content
    end

    def move
      anchored = params.key?(:before_id)
      direction = params[:direction]
      unless anchored || %w[up down].include?(direction)
        return render_error(:unprocessable_content, "direcao_invalida")
      end

      payload = @list.with_lock do
        authorize_access!(@list)
        return if performed?

        items = @list.list_items.to_a
        index = items.index { |item| item.id == @item.id }
        return render_error(:not_found, "nao_encontrado") unless index

        if anchored
          before_id = params[:before_id]
          unless before_id.nil? || (before_id.is_a?(String) && items.any? { |item| item.id == before_id })
            return render_error(:unprocessable_content, "destino_invalido")
          end
          moving = items.delete_at(index)
          target = before_id.nil? ? items.length : items.index { |item| item.id == before_id }
          target = index if before_id == moving.id
          items.insert(target, moving)
        else
          target = index + (direction == "up" ? -1 : 1)
          items[index], items[target] = items[target], items[index] if target.between?(0, items.length - 1)
        end
        if target.between?(0, items.length - 1)
          items.each_with_index do |item, position|
            item.update_columns(position: position + 1) if item.position != position + 1
          end
          @list.touch
        end

        { order: items.map(&:id), order_updated_at: @list.updated_at.iso8601(6) }
      end
      ListBroadcaster.broadcast(@list, "items_reordered", payload)
      render json: payload
    end

    private

    def set_list
      @list = List.find(params[:list_id])
    end

    def set_item
      @item = @list.list_items.find(params[:id])
    end

    def authorize_list_access!
      authorize_access!(@list)
    end

    def item_params
      params.expect(item: [ :content, :done, metadata: {} ])
    end

    def render_invalid(exception)
      return render_duplicate if exception.record.errors.of_kind?(:content, :taken)

      super
    end

    def render_duplicate
      render_error(:unprocessable_content, "item_duplicado")
    end
  end
end
