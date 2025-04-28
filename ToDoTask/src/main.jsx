import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { MainPage } from './NavBar/routers/MainPage';
import { BrowserRouter } from 'react-router-dom';
//import './08-useReducer/intro-reducer'
//import { MultipleCustomHook } from './03-examples/MultipleCustomHook'
//import { FormWithCustomHook } from './02-useEffect/FormWithCustomHook'
//import { SimpleForm } from './02-useEffect/SimpleForm'
//import { HooksApp } from './HooksApp'
//import { CounterWithCustomHook } from './CounterWithCustomHook'
//import { CounterApp } from './01-useState/CounterApp'
//import { FocusScreen } from './04-useRef/FocusScreen'
//import { Layout } from './05-useLayoutEffect/LayoutEffect'
//import { Memorize } from './06-Memo/Memorize'
//import { MemoHook } from './06-Memo/MemoHook'
//import { CallbackHook } from './06-Memo/CallbackHook'
//import { Padre } from './07-tarea-memo/Padre'
//import { TodoApp } from './08-useReducer/TodoApp'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode> 
      <MainPage/>
    </StrictMode>
  </BrowserRouter>
)