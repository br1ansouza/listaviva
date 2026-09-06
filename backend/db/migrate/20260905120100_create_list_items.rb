class CreateListItems < ActiveRecord::Migration[8.1]
  def change
    create_table :list_items, id: :uuid do |t|
      t.references :list, null: false, foreign_key: true, type: :uuid
      t.string :content, null: false
      t.boolean :done, null: false, default: false
      t.integer :position, null: false, default: 0
      t.jsonb :metadata
      t.string :updated_by_device_id

      t.timestamps
    end

    add_index :list_items, [ :list_id, :position ]
  end
end
