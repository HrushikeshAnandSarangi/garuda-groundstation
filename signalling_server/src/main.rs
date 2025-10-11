use std::{ sync::Arc};

use actix_web::{web,App, HttpServer};
use dashmap::DashMap;
use tracing::info;
use uuid::Uuid;



type AppState=Arc<DashMap<String,DashMap<Uuid,actix_ws::Session>>>;



#[actix_web::main]
async fn main()-> std::io::Result<()>{
    tracing_subscriber::fmt::init();
    let state=web::Data::new(AppState::default());
    info!("Starting Signalling server!");

    HttpServer::new(move||{
        App::new()
            .app_data(state.clone())
            .route("/ws/{room_id}", route)
    })
    .bind(("0.0.0.0",8000))?
    .run()
    .await
}
