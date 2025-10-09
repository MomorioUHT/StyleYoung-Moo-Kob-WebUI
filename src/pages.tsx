import { Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./LoginRegisterPage/LoginRegisterPage";

import CustomerHomePage from "./Customer/CustomerHomePage";

import AdminDashboard from "./StaffPages/Admin/Admin-Dashboard";
import AdminStaffManagement from "./StaffPages/Admin/Admin-StaffManagement";
import AdminCustomerManagement from "./StaffPages/Admin/Admin-CustomerManagement";
import AdminProductManagement from "./StaffPages/Admin/Admin-ProductManagement";
import AdminSupplierManagement from "./StaffPages/Admin/Admin-SupplierManagement";
import AdminRestaurantManagement from "./StaffPages/Admin/Admin-RestaurantManagement";
import AdminIngredientManagement from "./StaffPages/Admin/Admin-IngredientManagement";
import AdminRecipeManagement from "./StaffPages/Admin/Admin-RecipeManagement";

import WarehouseDashboard from "./StaffPages/Warehouse/Warehouse-Dashboard";
import WarehouseSupplylogs from "./StaffPages/Warehouse/Warehouse-SupplyLogs";

import ProductionDashboard from "./StaffPages/Production/Production-Dashboard";
import ProductionProductionLogs from "./StaffPages/Production/Production-ProductionLogs";

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

            <Route path='/warehouse/dashboard' element={<WarehouseDashboard />}/>
            <Route path='/warehouse/supplylogs' element={<WarehouseSupplylogs />}/>

            <Route path='/production/dashboard' element={<ProductionDashboard />} />
            <Route path='/production/prodlogs' element={<ProductionProductionLogs />} />

            <Route path='/home' element={<CustomerHomePage />}/>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>            
        </div>
    )
}

export default App;