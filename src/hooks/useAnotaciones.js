import { useState, useCallback } from "react";
import { useDataContext } from "../context/DataContext";
import {
  createAnotacion,
  updateAnotacion,
  deleteAnotacion,
} from "../repositories/ejecucionesRepository";

export const useAnotaciones = () => {
  const { refresh } = useDataContext();
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState(null);

  const save = useCallback(async (payload, id = null) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (id) {
        await updateAnotacion(id, payload);
      } else {
        await createAnotacion(payload);
      }
      refresh();
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id) => {
    try {
      await deleteAnotacion(id);
      refresh();
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    }
  }, [refresh]);

  return { save, remove, saving, saveError };
};
