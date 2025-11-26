// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import RequireAuth from "./components/RequireAuth";
import GuestOnly from "./components/GuestOnly";
import {Loader} from "lucide-react"

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
// import AdminHome from "./pages/admin/AdminHome";
// import AdminUsers from "./pages/admin/AdminUsers";
import StoreLayout from "./pages/userStore/storeLayout";
// import StoreHome from "./pages/store/StoreHome";
// import StoreInventory from "./pages/store/StoreInventory";
import UserLayout from "./pages/user/UserLayout";
import Navbar from "./components/Navbar";
import AdminAllUsers from "./components/AdminAllUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateUser from "./pages/admin/AdminAddUser";
import AdminStores from "./pages/admin/AdminStores";
import AdminCreateStore from "./pages/admin/AdminCreateStore";
import AdminRatings from "./pages/admin/AdminAllRatings";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import UserDashboard from "./pages/user/UserDashboard";
import UserStores from "./pages/user/UserStores";
import MyRatings from "./pages/user/MyRatings";
import ChangePassword from "./components/ChangePassword";
import StoreDashboard from "./pages/userStore/StoreDash";
// import UserHome from "./pages/user/UserHome";
// import NotFound from "./pages/NotFound";

function App(){
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

   useEffect(() => {
    checkAuth();
    }, [checkAuth]);
    if (isCheckingAuth && !authUser) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader className="size-10 animate-spin" />
        </div>
      );
    }
   const rootRedirect = authUser
    ? (authUser.role === "admin" ? "/admin" : authUser.role === "store_owner" ? "/store" : "/dashboard")
    : "/login";

  return (
    <div>
      <Navbar/>
      <div className="pt-16">
      <Routes>
        <Route path="/" element={<Navigate to={rootRedirect} replace />} /> 
        <Route path="/login" element={<GuestOnly><Login/></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><Signup/></GuestOnly>} />
        <Route element={<RequireAuth allowedRoles={['admin','store_owner','normal_user']} />}>
          <Route path="/changePassword" element={<ChangePassword/>} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="allUsers" element={<AdminAllUsers/>} />
            <Route path="allStores" element={<AdminStores/>} />
            <Route path="addUser" element={<AdminCreateUser/>} />           
            <Route path="createStore" element={<AdminCreateStore/>} />           
            <Route path="allRatings" element={<AdminRatings/>} />    
            <Route path="users/:id" element={<AdminUserDetails/>} />       
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['store_owner']} />}>
          <Route path="/store" element={<StoreLayout/>}>
            <Route index element={<StoreDashboard/>} />
           
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['normal_user']} />}>
          <Route path="/dashboard" element={<UserLayout/>}>
            <Route index element={<UserDashboard/>} />
            <Route path="stores" element={<UserStores/>} />        
            <Route path="my-ratings" element={<MyRatings/>} />        
          </Route>
        </Route>

        
        {/* <Route path="*" element={<NotFound/>} /> */}
      </Routes>
      </div>
    </div>
  );
}

export default App;
