import { useEffect, useState } from "react";
import { useForm } from "../hook/index";


export const FormTask = () => {
  const [image, setImage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [date, setDate] = useState(""); // Estado para la fecha seleccionada

  const { formState, onInputChange, username, password, email, onResetForm } = useForm({
    username: '',
    email: '',
    passwrord: '',
    onResetForm: '',
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar el cambio de fecha
  const handleDateChange = (e) => {
    setDate(e.target.value); // Actualiza el estado con la fecha seleccionada
  };

  return (
    <>
      <h1>Formulario</h1>
      <hr />

      <input
        type="text"
        className="form-control"
        placeholder="Username"
        name="username"
        value={username}
        onChange={onInputChange}
      />

      <hr />

      <input
        type="email"
        className="form-control mt-2"
        placeholder="correo@gmail.com"
        name="email"
        value={email}
        onChange={onInputChange}
      />

      <input
        type="text"
        className="form-control mt-2"
        placeholder="Area"
        name="password"
        value={password}
        onChange={onInputChange}
      />

      {/* Campo para seleccionar la fecha */}
      <h2 className="text-xl font-bold mb-4 mt-3">Seleccionar Fecha</h2>
      <div className="mb-4">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="form-control"
        />
        {date && <p className="mt-2">Fecha seleccionada: {date}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-3">Subir Imagen</h2>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="btn btn-primary mt-2"
        />
        {image && <img src={image} alt="Subida" className="mt-2 rounded shadow" />}
      </div>

      <h2 className="text-xl font-bold mb-4">Lista de Tareas</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Nueva tarea..."
        />

        <button onClick={addTask} className="btn btn-primary mt-2">
          Agregar
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex justify-between items-center p-2 border-b ${task.completed ? "line-through text-gray-500" : ""}`}
          >
            <span onClick={() => toggleTask(task.id)} className="cursor-pointer">
              {task.text}
            </span>

            <button onClick={() => removeTask(task.id)} className="btn btn-primary mt-2">
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <button onClick={onResetForm} className="btn btn-primary mt-2">
        Borrar
      </button>
    </>
  );
};
