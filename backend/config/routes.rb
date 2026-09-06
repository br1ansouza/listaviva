Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :lists, only: [ :create, :show, :update ] do
      collection do
        get :mine
        get "by_token/:token", action: :by_token, as: :by_token
      end

      member do
        post :share
      end

      resources :items, controller: "list_items", only: [ :create, :update, :destroy ]
    end
  end

  mount ActionCable.server => "/cable"
end
