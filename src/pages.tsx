import { Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./LoginRegisterPage/LoginRegisterPage";
import AdminDashboard from "./StaffDashboard/AdminDashboard";
import CustomerHomePage from "./Customer/CustomerHomePage";

function App() {
    return (
        <div>
        <Routes>
            <Route path='/' element={<Navigate to='/welcome' replace={true}/>}/>
            <Route path='/welcome' element={<LoginRegister />}/>
            <Route path='/administrator' element={<AdminDashboard />}/>
            <Route path='/home' element={<CustomerHomePage />}/>
        </Routes>            
        </div>
    )
}

export default App;