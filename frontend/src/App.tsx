import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import { history } from './helpers/history';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from 'components/Register';
import TestPage from './components/TestPage';
import CreateQuiz from 'components/Quiz/QuizCreate';
import QuizDetails from 'components/Quiz/QuizDetails';
import QuizSolve from 'components/Quiz/QuizSolve';
import QuizResults from 'components/Quiz/QuizResults';
import UserQuizzes from 'components/Profile/UserQuizzes';
import QuizList from 'components/Quiz/QuizList';
import Home from 'components/Home';
import HostPanel from 'components/Game/HostPanel';
import PlayerPanel from 'components/Game/PlayerPanel';
import ChangePassword from 'components/Profile/ChangePassword';
import ProfileNavigation from 'components/Profile/ProfileNavigation';
import SolvedQuizesDashboard from 'components/Profile/SolvedQuizesDashboard';
import PathCreate from 'components/Path/PathCreate';
import PathDetails from 'components/Path/PathDetails';
import PathList from 'components/Path/PathList';

export default function App() {
  // init custom history object to allow navigation from 
  // anywhere in the react app (inside or outside components)
  history.navigate = useNavigate();
  history.location = useLocation();

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path='/' element={<PlayerPanel/>}></Route>
        <Route path='/authtest' element={<TestPage/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/quiz/createQuiz' element={<CreateQuiz/>}></Route>
        <Route path='/quizList' element={<QuizList/>}></Route>
        <Route path='/quiz/details/:id' element={<QuizDetails/>}></Route>
        <Route path='/quiz/solve/:id' element={<QuizSolve/>}></Route>
        <Route path='/quiz/results' element={<QuizResults/>}></Route>
        <Route path='/quiz/hostPanel/:id' element={<HostPanel/>}></Route>
        <Route path='/game/:id' element={<PlayerPanel/>}></Route>
        <Route path='/user' element={<ProfileNavigation/>}></Route>
        <Route path='/user/quizzes' element={<UserQuizzes/>}></Route>
        <Route path='/user/changePassword' element={<ChangePassword/>}></Route>
        <Route path='/user/solvedQuizzes' element={<SolvedQuizesDashboard/>}></Route>
        <Route path='/teacher/createPath' element={<PathCreate/>}></Route>
        <Route path='/pathList' element={<PathList/>}></Route>
        <Route path='/path/details/:id' element={<PathDetails/>}></Route>
      </Routes>
    </>
  )
}
