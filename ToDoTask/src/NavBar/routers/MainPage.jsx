
import { NavBar, TaskPage, HomePage, CalendarPage, TodoApp, SearchPage, UsuarioPage, DataXpage, StudioDesignPage, GeneralSystechPage } from "../index"
import { Routes, Route, Navigate } from "react-router-dom"


export const MainPage = () => {
  return (
    <>
        <NavBar/>
        
            <Routes>
                <Route path="hacer" element={<TodoApp />} />
                <Route path="datax" element={<DataXpage />} />
                <Route path="studiodesign" element={<StudioDesignPage />} />
                <Route path="general" element={<GeneralSystechPage />} />
                <Route path="calendario" element={<CalendarPage/>} />
                <Route path="inicio" element={<HomePage/> } />
                <Route path="tareas" element={<TaskPage/>} />
                <Route path="Usuario/:id" element={<UsuarioPage/>} />
                <Route path="buscar" element={<SearchPage/> }  />
                <Route paths="/*" element={<Navigate to="/#"/> } />       
            </Routes>
    </>
  )
}
