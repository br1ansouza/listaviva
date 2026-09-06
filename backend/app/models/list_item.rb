class ListItem < ApplicationRecord
  METADATA_BYTE_LIMIT = 2_000

  belongs_to :list, touch: true

  validates :content, presence: true, length: { maximum: 500 }
  validates :updated_by_device_id, length: { maximum: 64 }, allow_nil: true
  validate :metadata_within_limit

  before_validation :assign_position, on: :create

  private

  def assign_position
    return if position.present? && position.positive?

    self.position = (list&.list_items&.maximum(:position) || 0) + 1
  end

  def metadata_within_limit
    return if metadata.blank?

    errors.add(:metadata, "excede o tamanho maximo") if metadata.to_json.bytesize > METADATA_BYTE_LIMIT
  end
end
