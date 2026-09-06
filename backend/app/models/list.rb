class List < ApplicationRecord
  SHARE_DURATIONS = {
    "8h" => 8.hours,
    "1d" => 1.day,
    "1w" => 1.week
  }.freeze

  TOKEN_BYTES = 16
  SLUG_FORMAT = /\A[a-z][a-z0-9-]{0,39}\z/

  has_many :list_items, -> { order(:position, :created_at) }, dependent: :destroy

  validates :title, presence: true, length: { maximum: 120 }
  validates :list_type, format: { with: SLUG_FORMAT }
  validates :icon, format: { with: SLUG_FORMAT }
  validates :color, format: { with: SLUG_FORMAT }
  validates :creator_device_id, presence: true, length: { maximum: 64 }

  scope :created_by, ->(device_id) { where(creator_device_id: device_id) }
  scope :expired, -> { where.not(expires_at: nil).where(expires_at: ...Time.current) }

  def self.generate_share_token
    loop do
      token = SecureRandom.urlsafe_base64(TOKEN_BYTES)
      return token unless exists?(share_token: token)
    end
  end

  def share!(duration_key)
    duration = SHARE_DURATIONS.fetch(duration_key)
    update!(share_token: self.class.generate_share_token, expires_at: duration.from_now)
  end

  def shared?
    share_token.present?
  end

  def expired?
    expires_at.present? && expires_at.past?
  end

  def created_by?(device_id)
    device_id.present? && creator_device_id == device_id
  end

  def channel_name
    "list:#{id}"
  end
end
