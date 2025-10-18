import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import LoginRegister from "./LoginRegisterPage/LoginRegisterPage";

// Customer Pages
import CustomerHomePage from "./Customer/Customer-HomePage";
import CustomerCartPage from "./Customer/Customer-CartPage";
import CustomerOrderPage from "./Customer/Customer-OrderPage";

// Admin Pages
import AdminDashboard from "./StaffPages/Admin/Admin-Dashboard";
import AdminStaffManagement from "./StaffPages/Admin/Admin-StaffManagement";
import AdminCustomerManagement from "./StaffPages/Admin/Admin-CustomerManagement";
import AdminProductManagement from "./StaffPages/Admin/Admin-ProductManagement";
import AdminSupplierManagement from "./StaffPages/Admin/Admin-SupplierManagement";
import AdminRestaurantManagement from "./StaffPages/Admin/Admin-RestaurantManagement";
import AdminIngredientManagement from "./StaffPages/Admin/Admin-IngredientManagement";
import AdminRecipeManagement from "./StaffPages/Admin/Admin-RecipeManagement";

// Warehouse Pages
import WarehouseDashboard from "./StaffPages/Warehouse/Warehouse-Dashboard";
import WarehouseSupplylogs from "./StaffPages/Warehouse/Warehouse-SupplyLogs";

// Production Pages
import ProductionDashboard from "./StaffPages/Production/Production-Dashboard";
import ProductionProductionLogs from "./StaffPages/Production/Production-ProductionLogs";

// QC Pages
import QCDashboard from "./StaffPages/QC/QC-Dashboard";
import QCQCLogs from "./StaffPages/QC/QC-QCLogs";

// Sales Pages
import SalesDashboard from "./StaffPages/Sales/Sales-Dashboard";
import SalesCustomerOrderPage from "./StaffPages/Sales/Sales-CustomerOrderPage";
import SalesRestaurantOrderPage from "./StaffPages/Sales/Sales-RetaurantOrderPage";
import SalesDeliveryPage from "./StaffPages/Sales/Sales-DeliveryPage";

// Utility Pages
import NotFoundPage from "./middleware/NotFoundPage";

/**
 * Main application component
 * Defines all application routes and navigation structure
 */
function App() {
    return (
        <div>
            <Routes>
                {/* Root and Authentication Routes */}
                <Route path='/' element={<Navigate to='/welcome' replace={true}/>}/>
                <Route path='/welcome' element={<LoginRegister />}/>

                {/* Administrator Routes */}
                <Route path='/administrator/dashboard' element={<AdminDashboard />}/>
                <Route path='/administrator/staffs' element={<AdminStaffManagement />}/>
                <Route path='/administrator/customers' element={<AdminCustomerManagement />}/>
                <Route path='/administrator/products' element={<AdminProductManagement />}/>
                <Route path='/administrator/suppliers' element={<AdminSupplierManagement />}/>
                <Route path='/administrator/restaurants' element={<AdminRestaurantManagement />}/>
                <Route path='/administrator/ingredients' element={<AdminIngredientManagement />}/>
                <Route path='/administrator/recipes' element={<AdminRecipeManagement />}/>

                {/* Warehouse Routes */}
                <Route path='/warehouse/dashboard' element={<WarehouseDashboard />}/>
                <Route path='/warehouse/supplylogs' element={<WarehouseSupplylogs />}/>

                {/* Production Routes */}
                <Route path='/production/dashboard' element={<ProductionDashboard />} />
                <Route path='/production/prodlogs' element={<ProductionProductionLogs />} />

                {/* Quality Control Routes */}
                <Route path='/qc/dashboard' element={<QCDashboard />} />
                <Route path='/qc/qclogs' element={<QCQCLogs />} />

                {/* Customer Routes */}
                <Route path='/home' element={<CustomerHomePage />}/>
                <Route path='/cart' element={<CustomerCartPage />}/>
                <Route path='/orders' element={<CustomerOrderPage />} />

                {/* Sales Routes */}
                <Route path='/sales/dashboard' element={<SalesDashboard />}/>
                <Route path='/sales/customer-orders' element={<SalesCustomerOrderPage />} />
                <Route path='/sales/restaurant-orders' element={<SalesRestaurantOrderPage />} />
                <Route path='/sales/delivery' element={<SalesDeliveryPage />} />

                {/* 404 Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>            
        </div>
    );
}

export default App;