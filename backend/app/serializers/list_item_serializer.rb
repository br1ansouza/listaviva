module ListItemSerializer
  module_function

  def call(item)
    {
      id: item.id,
      list_id: item.list_id,
      content: item.content,
      done: item.done,
      position: item.position,
      metadata: item.metadata,
      created_by_device_id: item.created_by_device_id,
      updated_by_device_id: item.updated_by_device_id,
      created_by_name: item.created_by_name,
      updated_by_name: item.updated_by_name,
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  end
end
