module Api
  class ListItemsController < ApplicationController
    include ListAccess

    before_action :set_list
    before_action :authorize_list_access!
    before_action :set_item, only: [ :update, :destroy ]

    def create
      item = @list.list_items.create!(
        item_params.merge(created_by_device_id: device_id, updated_by_device_id: device_id),
      )
      ListBroadcaster.item_created(item)

      render json: ListItemSerializer.call(item), status: :created
    end

    def update
      @item.update!(item_params.merge(updated_by_device_id: device_id))
      ListBroadcaster.item_updated(@item)

      render json: ListItemSerializer.call(@item)
    end

    def destroy
      @item.destroy!
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
      params.require(:item).permit(:content, :done, :position, metadata: {})
    end
  end
end
