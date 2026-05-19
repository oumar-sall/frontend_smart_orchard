/**
 * Configuration matérielle pour les boîtiers GalileoSky
 * Centralise les entrées/sorties physiques disponibles.
 */

export const HARDWARE_CONFIG = {
  GALILEOSKY: {
    NAME: "GalileoSky v10/v7",
    SENSOR_PINS: [
      { value: "IN 0", label: "IN 0" },
      { value: "IN 1", label: "IN 1" },
      { value: "IN 2", label: "IN 2" },
      { value: "IN 3", label: "IN 3" },
      { value: "IN 4", label: "IN 4" },
      { value: "IN 5", label: "IN 5" },
      { value: "VOL 0", label: "VOL 0" },
      { value: "VOL 1", label: "VOL 1" },
      { value: "1-WIRE", label: "Bus 1-Wire" },
      { value: "485 A", label: "RS485 A" },
      { value: "485 B", label: "RS485 B" },
    ],
    ACTUATOR_PINS: [
      { value: "OUT 0", label: "OUT 0" },
      { value: "OUT 1", label: "OUT 1" },
      { value: "OUT 2", label: "OUT 2" },
      { value: "OUT 3", label: "OUT 3" },
    ]
  },
  DEFAULTS: {
    V_MIN: 0,
    V_MAX: 10,
  }
};

export const COMPONENT_TYPES = ['capteur', 'actionneur'];

export const SENSOR_UNITS = ['°C', '%', 'pH', 'V', 'bar', 'mA'];
