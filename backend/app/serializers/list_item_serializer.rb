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
      updated_by_device_id: item.updated_by_device_id,
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  end
end
