class ListCreation
  class LimitReached < StandardError
    attr_reader :oldest

    def initialize(oldest)
      @oldest = oldest
      super("limite_de_listas")
    end
  end

  def self.call(attributes, device_id:, replacement_id: nil, replacement_version: nil)
    List.transaction do
      lock_key = Digest::SHA256.digest("listaviva/lists/#{device_id}").unpack1("q>")
      List.connection.exec_query("SELECT pg_advisory_xact_lock($1::bigint)", "Lock list quota", [ lock_key ])
      owned = List.created_by(device_id)
      replaced = nil

      if owned.count >= List::DEVICE_LIMIT
        oldest = owned.order(:created_at, :id).lock.first!
        unless replacement_id == oldest.id && replacement_version == oldest.updated_at.iso8601(6)
          raise LimitReached.new(oldest)
        end

        replaced = oldest
        replaced.destroy!
      end

      list = List.create!(attributes.merge(creator_device_id: device_id))
      [ list, replaced ]
    end
  end
end
