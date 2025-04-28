import { useState } from "react";

const useDateRange = (initialState = { fecha_inicio: "", fecha_fin: "" }) => {
  const [dateRanges, setDateRanges] = useState(initialState);

  // Maneja cambios de fecha
  const handleDateChange = (field, value) => {
    setDateRanges((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return { dateRanges, handleDateChange };
};

export default useDateRange;
