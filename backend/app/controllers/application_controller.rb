class ApplicationController < ActionController::API
  DEVICE_ID_HEADER = "HTTP_X_DEVICE_ID".freeze
  SHARE_TOKEN_HEADER = "HTTP_X_SHARE_TOKEN".freeze
  DEVICE_NAME_HEADER = "HTTP_X_DEVICE_NAME".freeze

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_invalid
  rescue_from ActionController::ParameterMissing, with: :render_bad_request

  private

  def device_id
    @device_id ||= request.get_header(DEVICE_ID_HEADER).presence
  end

  def share_token
    @share_token ||= request.get_header(SHARE_TOKEN_HEADER).presence
  end

  def device_name
    return @device_name if defined?(@device_name)

    raw = request.get_header(DEVICE_NAME_HEADER).presence
    @device_name = raw && CGI.unescape(raw).grapheme_clusters.first(ListItem::AUTHOR_NAME_LIMIT).join.strip.presence
  end

  def require_device_id!
    render_error(:bad_request, "device_id_ausente") if device_id.blank?
  end

  def render_not_found
    render_error(:not_found, "nao_encontrado")
  end

  def render_invalid(exception)
    render json: { error: "invalido", details: exception.record.errors.full_messages }, status: :unprocessable_content
  end

  def render_bad_request
    render_error(:bad_request, "parametros_invalidos")
  end

  def render_error(status, code)
    render json: { error: code }, status: status
  end
end
