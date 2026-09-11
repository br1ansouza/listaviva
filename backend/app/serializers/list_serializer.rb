module ListSerializer
  module_function

  def call(list, device_id: nil)
    attributes(list, device_id: device_id).merge(
      items: list.list_items.map { |item| ListItemSerializer.call(item) }
    )
  end

  def summary(list, device_id: nil)
    attributes(list, device_id: device_id).merge(items_count: list.list_items.size)
  end

  def attributes(list, device_id: nil)
    {
      id: list.id,
      title: list.title,
      list_type: list.list_type,
      icon: list.icon,
      color: list.color,
      favorite: list.favorite,
      share_token: list.share_token,
      expires_at: list.expires_at,
      expired: list.expired?,
      is_creator: list.created_by?(device_id),
      participant_id: AuthorIdentity.for(list.id, device_id),
      created_at: list.created_at,
      updated_at: list.updated_at
    }
  end
end
