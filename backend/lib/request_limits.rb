require "stringio"

class RequestLimits
  MAX_BODY_BYTES = 32_768

  def initialize(app)
    @app = app
  end

  def call(env)
    if env["PATH_INFO"].start_with?("/api/") && %w[POST PATCH PUT].include?(env["REQUEST_METHOD"])
      return too_large if env["CONTENT_LENGTH"].to_i > MAX_BODY_BYTES

      body = env["rack.input"]&.read(MAX_BODY_BYTES + 1).to_s
      return too_large if body.bytesize > MAX_BODY_BYTES

      env["rack.input"] = StringIO.new(body)
    end

    @app.call(env)
  end

  private

  def too_large
    [ 413, { "content-type" => "application/json", "cache-control" => "no-store" }, [ '{"error":"requisicao_muito_grande"}' ] ]
  end
end
