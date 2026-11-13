module ApplicationCable
  class Connection < ActionCable::Connection::Base
    MAX_CONNECTIONS_PER_IP = 20
    MAX_COMMANDS_PER_WINDOW = 30
    COMMAND_WINDOW_SECONDS = 10

    identified_by :client_id
    attr_reader :device_id, :share_token

    before_command :limit_command_rate

    @connections_per_ip = Hash.new(0)
    @connections_lock = Mutex.new

    class << self
      def claim_connection(ip)
        @connections_lock.synchronize do
          return false if @connections_per_ip[ip] >= MAX_CONNECTIONS_PER_IP

          @connections_per_ip[ip] += 1
          true
        end
      end

      def release_connection(ip)
        @connections_lock.synchronize do
          @connections_per_ip[ip] -= 1
          @connections_per_ip.delete(ip) if @connections_per_ip[ip] <= 0
        end
      end
    end

    def connect
      @device_id = request.params[:device_id].presence
      @share_token = request.params[:share_token].presence

      reject_unauthorized_connection unless DeviceIdentity.valid?(device_id)
      reject_unauthorized_connection unless self.class.claim_connection(client_ip)
      @connection_claimed = true
      self.client_id = SecureRandom.uuid
    end

    def disconnect
      self.class.release_connection(client_ip) if @connection_claimed
    end

    private

    def client_ip
      @client_ip ||= request.remote_ip.to_s
    end

    def limit_command_rate
      now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      if @command_window_started_at.nil? || now - @command_window_started_at > COMMAND_WINDOW_SECONDS
        @command_window_started_at = now
        @commands_in_window = 0
      end
      @commands_in_window += 1
      return if @commands_in_window <= MAX_COMMANDS_PER_WINDOW

      close(reason: "muitos_comandos", reconnect: false)
      throw :abort
    end
  end
end
