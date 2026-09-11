class AddFavoriteToLists < ActiveRecord::Migration[8.1]
  def change
    add_column :lists, :favorite, :boolean, null: false, default: false
    add_index :lists, [ :creator_device_id, :favorite, :updated_at ]
  end
end
