module ListBroadcaster
  module_function

  def list_updated(list)
    broadcast(list, "list_updated", ListSerializer.call(list).except(:items, :is_creator))
  end

  def item_created(item)
    broadcast(item.list, "item_created", ListItemSerializer.call(item))
  end

  def item_updated(item)
    broadcast(item.list, "item_updated", ListItemSerializer.call(item))
  end

  def item_destroyed(item)
    broadcast(item.list, "item_destroyed", { id: item.id, list_id: item.list_id })
  end

  def broadcast(list, event, payload)
    ActionCable.server.broadcast(list.channel_name, { event: event, payload: payload })
  end
end
