class AddAuthorNamesAndUniqueContentToListItems < ActiveRecord::Migration[8.1]
  def up
    add_column :list_items, :created_by_name, :string
    add_column :list_items, :updated_by_name, :string

    execute <<~SQL
      UPDATE list_items SET content = btrim(regexp_replace(content, '\\s+', ' ', 'g'));
    SQL

    execute <<~SQL
      DELETE FROM list_items a
      USING list_items b
      WHERE a.list_id = b.list_id
        AND lower(a.content) = lower(b.content)
        AND (a.created_at, a.id) > (b.created_at, b.id);
    SQL

    execute <<~SQL
      CREATE UNIQUE INDEX index_list_items_on_list_id_and_lower_content
        ON list_items (list_id, lower(content));
    SQL
  end

  def down
    execute "DROP INDEX IF EXISTS index_list_items_on_list_id_and_lower_content;"
    remove_column :list_items, :updated_by_name
    remove_column :list_items, :created_by_name
  end
end
