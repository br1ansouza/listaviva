class ListItem < ApplicationRecord
  METADATA_BYTE_LIMIT = 2_000
  AUTHOR_NAME_LIMIT = 15
  PER_LIST_LIMIT = 230

  belongs_to :list, touch: true

  validates :content, presence: true, length: { maximum: 500 }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 2_147_483_647 }
  validates :content,
    uniqueness: { scope: :list_id, case_sensitive: false, message: "ja esta na lista" },
    allow_blank: true
  validates :updated_by_device_id, length: { maximum: 64 }, allow_nil: true
  validates :created_by_device_id, length: { maximum: 64 }, allow_nil: true
  validates :updated_by_name, length: { maximum: AUTHOR_NAME_LIMIT }, allow_nil: true
  validates :created_by_name, length: { maximum: AUTHOR_NAME_LIMIT }, allow_nil: true
  validate :metadata_within_limit

  before_validation :normalize_content
  before_validation :assign_position, on: :create

  private

  def normalize_content
    return if content.nil?

    self.content = content.gsub(/[[:space:]]+/, " ").strip
  end

  def assign_position
    return if position.present? && position.positive?

    self.position = (list&.list_items&.maximum(:position) || 0) + 1
  end

  def metadata_within_limit
    return if metadata.blank?

    errors.add(:metadata, "excede o tamanho maximo") if metadata.to_json.bytesize > METADATA_BYTE_LIMIT
  end
end
