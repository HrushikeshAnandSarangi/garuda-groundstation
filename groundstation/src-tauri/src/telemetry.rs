use serde::Serialize;

#[derive(Debug, Serialize, Clone, Default)]
pub struct Telemetry {
    pub battery: Option<f32>,
    pub altitude: Option<f32>,
    pub speed: Option<f32>,
    pub satellites: Option<u8>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub heading: Option<f32>,
    pub pitch: Option<f32>,
    pub roll: Option<f32>,
}
