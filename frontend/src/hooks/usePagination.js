import { useState } from "react";

const usePagination = (filteredUsuarios, usersPerPage) => {
  // Estado para la página actual.
  const [currentPage, setCurrentPage] = useState(1);

  // Calcula los índices para la paginación.
  const indexOfLastuser = currentPage * usersPerPage;
  const indexOfFirstuser = indexOfLastuser - usersPerPage;
  // Obtiene los usuarios para la página actual.
  const current = filteredUsuarios.slice(indexOfFirstuser, indexOfLastuser);
  // Calcula el total de páginas.
  const totalPages = Math.ceil(filteredUsuarios.length / usersPerPage);

  // Función para ir a la siguiente página.
  const setNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Función para ir a la página anterior.
  const setPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Retorna los datos y funciones para la paginación.
  return {
    current,
    currentPage,
    totalPages,
    setNextPage,
    setPreviousPage,
  };
};

export default usePagination;