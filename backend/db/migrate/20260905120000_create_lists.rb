class CreateLists < ActiveRecord::Migration[8.1]
  def change
    create_table :lists, id: :uuid do |t|
      t.string :title, null: false
      t.string :list_type, null: false, default: "todo"
      t.string :icon, null: false, default: "check-square"
      t.string :color, null: false, default: "coral"
      t.string :creator_device_id, null: false
      t.string :share_token
      t.datetime :expires_at

      t.timestamps
    end

    add_index :lists, :creator_device_id
    add_index :lists, :share_token, unique: true
    add_index :lists, :expires_at
  end
end
