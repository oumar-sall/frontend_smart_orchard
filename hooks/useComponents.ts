import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import api from '@/utils/api';
import { storage } from '@/utils/storage';

const ITEMS_PER_PAGE = 7;

export function useComponents(activeTab: 'capteurs' | 'actionneurs') {
  const [sensors, setSensors] = useState<any[]>([]);
  const [actuators, setActuators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [sensorPage, setSensorPage] = useState(1);
  const [actuatorPage, setActuatorPage] = useState(1);

  // Modal & Form State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [label, setLabel] = useState("");
  const [pin, setPin] = useState("");
  const [unit, setUnit] = useState("");
  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");
  const [vMin, setVmin] = useState("0");
  const [vMax, setVmax] = useState("10");
  const [modbusTag, setModbusTag] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const params = { controller_id: controllerId };

      const [resSensors, resActuators] = await Promise.all([
        api.get(`/readings/sensors`, { params }),
        api.get(`/readings/actuators`, { params })
      ]);
      setSensors(resSensors.data || []);
      setActuators(resActuators.data || []);
    } catch (error) {
      console.error("Erreur fetch composants data: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const usedPins = useMemo(() => {
    const pins = new Set<string>();
    sensors.forEach(s => { if (s.id !== editingId && !s.pin_number.startsWith('485')) pins.add(s.pin_number); });
    actuators.forEach(a => { if (a.id !== editingId && !a.pin_number.startsWith('485')) pins.add(a.pin_number); });
    return pins;
  }, [sensors, actuators, editingId]);

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
    setLabel(item.label || "");
    setPin(item.pin_number || "");
    setUnit(item.unit || "");
    setMinVal(item.min_value?.toString() || "");
    setMaxVal(item.max_value?.toString() || "");
    setVmin(item.v_min?.toString() || "0");
    setVmax(item.v_max?.toString() || "10");
    setModbusTag(item.modbus_tag?.toString() || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!label.trim() || !pin.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const data = {
        label, pin_number: pin,
        unit: unit || undefined,
        min_value: minVal ? parseFloat(minVal) : undefined,
        max_value: maxVal ? parseFloat(maxVal) : undefined,
        v_min: vMin ? parseFloat(vMin) : 0,
        v_max: vMax ? parseFloat(vMax) : 10,
        modbus_tag: modbusTag ? parseInt(modbusTag) : undefined,
        controller_id: controllerId
      };

      if (editingId) {
        await api.put(`/readings/components/${editingId}`, data);
      } else {
        await api.post(`/readings/components`, {
          ...data,
          type: activeTab === 'capteurs' ? 'sensor' : 'actuator',
        });
      }

      setModalVisible(false);
      resetForm();
      fetchData();
      Alert.alert("Succès", editingId ? "Composant mis à jour" : "Composant ajouté");
    } catch (error: any) {
      Alert.alert("Erreur", error?.response?.data?.error || "Impossible d'enregistrer le composant");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Confirmer", "Supprimer ce composant ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        try {
          await api.delete(`/readings/components/${id}`);
          fetchData();
        } catch { Alert.alert("Erreur", "Suppression impossible"); }
      }}
    ]);
  };

  const resetForm = () => {
    setEditingId(null); setLabel(""); setPin(""); setUnit("");
    setMinVal(""); setMaxVal(""); setVmin("0"); setVmax("10");
    setModbusTag(""); setSelectedTemplate(null);
  };

  // Pagination Logic
  const paginatedSensors = sensors.slice((sensorPage - 1) * ITEMS_PER_PAGE, sensorPage * ITEMS_PER_PAGE);
  const totalSensorPages = Math.ceil(sensors.length / ITEMS_PER_PAGE) || 1;
  const paginatedActuators = actuators.slice((actuatorPage - 1) * ITEMS_PER_PAGE, actuatorPage * ITEMS_PER_PAGE);
  const totalActuatorPages = Math.ceil(actuators.length / ITEMS_PER_PAGE) || 1;

  return {
    sensors: paginatedSensors, totalSensorPages, sensorPage, setSensorPage,
    actuators: paginatedActuators, totalActuatorPages, actuatorPage, setActuatorPage,
    loading, usedPins, isModalVisible, setModalVisible,
    editingId, handleStartEdit, handleSave, handleDelete, resetForm,
    form: {
      label, setLabel, pin, setPin, unit, setUnit,
      minVal, setMinVal, maxVal, setMaxVal, vMin, setVmin, vMax, setVmax,
      modbusTag, setModbusTag, selectedTemplate, setSelectedTemplate
    }
  };
}
