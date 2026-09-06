module AuthorIdentity
  module_function

  def for(list_id, device_id)
    return if device_id.blank?

    key = Rails.application.key_generator.generate_key("listaviva/author-identities", 32)
    "author_#{OpenSSL::HMAC.hexdigest('SHA256', key, "#{list_id}:#{device_id}")}"
  end
end
