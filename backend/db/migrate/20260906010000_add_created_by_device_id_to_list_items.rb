class AddCreatedByDeviceIdToListItems < ActiveRecord::Migration[8.1]
  def change
    add_column :list_items, :created_by_device_id, :string
  end
end
