import { Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./LoginRegisterPage/LoginRegisterPage";

import CustomerHomePage from "./Customer/CustomerHomePage";

import AdminDashboard from "./StaffDashboard/Admin/Admin-Dashboard";
import AdminStaffManagement from "./StaffDashboard/Admin/Admin-StaffManagement";
import AdminCustomerManagement from "./StaffDashboard/Admin/Admin-CustomerManagement";
import AdminProductManagement from "./StaffDashboard/Admin/Admin-ProductManagement";
import AdminSupplierManagement from "./StaffDashboard/Admin/Admin-SupplierManagement";
import AdminRestaurantManagement from "./StaffDashboard/Admin/Admin-RestaurantManagement";
import AdminIngredientManagement from "./StaffDashboard/Admin/Admin-IngredientManagement";
import AdminRecipeManagement from "./StaffDashboard/Admin/Admin-RecipeManagement";

import NotFoundPage from "./middleware/NotFoundPage";

function App() {
    return (
        <div>
        <Routes>
            <Route path='/' element={<Navigate to='/welcome' replace={true}/>}/>
            <Route path='/welcome' element={<LoginRegister />}/>

            <Route path='/administrator/dashboard' element={<AdminDashboard />}/>
            <Route path='/administrator/staffs' element={<AdminStaffManagement />}/>
            <Route path='/administrator/customers' element={<AdminCustomerManagement />}/>
            <Route path='/administrator/products' element={<AdminProductManagement />}/>
            <Route path='/administrator/suppliers' element={<AdminSupplierManagement />}/>
            <Route path='/administrator/restaurants' element={<AdminRestaurantManagement />}/>
            <Route path='/administrator/ingredients' element={<AdminIngredientManagement />}/>
            <Route path='/administrator/recipes' element={<AdminRecipeManagement />}/>

            <Route path='/home' element={<CustomerHomePage />}/>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>            
        </div>
    )
}

export default App;