module Api
  class ListItemsController < ApplicationController
    include ListAccess

    rescue_from ActiveRecord::RecordNotUnique, with: :render_duplicate

    before_action :set_list
    before_action :authorize_list_access!
    before_action :set_item, only: [ :update, :destroy ]

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

        @item.reload.update!(item_params.merge(updated_by_device_id: device_id, updated_by_name: device_name))
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
