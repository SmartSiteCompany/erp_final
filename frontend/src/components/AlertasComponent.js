import React from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AlertComponent = ({
  type,
  entity,
  action,
  onConfirm,
  onCancel,
  message,
  swalOptions: customSwalOptions, // Permite pasar opciones personalizadas
  ...rest
}) => {
  const icons = {
    view: "uil uil-eye text-primary",
    delete: "uil uil-trash text-danger",
    create: "uil uil-plus-circle text-success",
    save: "uil uil-save text-warning",
    error: "uil uil-exclamation-octagon text-danger",
    confirmDelete: "uil uil-question-circle text-info",
  };

  const messages = {
    view: `Visualizando ${entity}`,
    delete: `${entity} eliminado correctamente`,
    create: `${entity} creado exitosamente`,
    save: `${entity} guardado con éxito`,
    error: `Error al procesar ${entity}`,
    confirmDelete: `¿Estás seguro de que deseas eliminar este ${entity}?`,
  };

  const modalClasses = {
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
    info: "text-info",
  };

  const showAlert = () => {
    let swalOptions = {
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${entity}`,
      text: message || messages[action],
      icon: type,
      showCancelButton: action === "confirmDelete",
      confirmButtonText: action === "confirmDelete" ? "Confirmar" : "Aceptar",
      cancelButtonText: "Cancelar",
      showCloseButton: true,
      customClass: {
        confirmButton: "btn btn-primary me-2",
        cancelButton: "btn btn-secondary",
      },
      ...customSwalOptions, // Aplica las opciones personalizadas
      ...rest, // Aplica otras opciones adicionales
    };

    if (action === "confirmDelete") {
      Swal.fire(swalOptions).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          onCancel();
        }
      });
    } else {
      Swal.fire(swalOptions).then(() => {
        if (onCancel) {
          onCancel();
        }
      });
    }
  };

  React.useEffect(() => {
    showAlert();
  }, [type, entity, action, onConfirm, onCancel, message, customSwalOptions, rest]);

  return <></>;
};

export default AlertComponent;