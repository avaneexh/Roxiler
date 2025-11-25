// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import RequireAuth from "./components/RequireAuth";
import GuestOnly from "./components/GuestOnly";


import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
// import AdminHome from "./pages/admin/AdminHome";
// import AdminUsers from "./pages/admin/AdminUsers";
import StoreLayout from "./pages/userStore/StoreLayout";
// import StoreHome from "./pages/store/StoreHome";
// import StoreInventory from "./pages/store/StoreInventory";
import UserLayout from "./pages/user/UserLayout";
// import UserHome from "./pages/user/UserHome";
// import NotFound from "./pages/NotFound";

function App(){
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

   const rootRedirect = authUser
    ? (authUser.role === "admin" ? "/admin" : authUser.role === "store_owner" ? "/store" : "/dashboard")
    : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={rootRedirect} replace />} /> 
        <Route path="/login" element={<GuestOnly><Login/></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><Signup/></GuestOnly>} />

        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* <Route index element={<AdminHome/>} /> */}
            {/* <Route path="users" element={<AdminUsers/>} /> */}
            {/* ...other admin routes */}
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['store_owner']} />}>
          <Route path="/store" element={<StoreLayout/>}>
            {/* <Route index element={<StoreHome/>} />
            <Route path="inventory" element={<StoreInventory/>} /> */}
            {/* ... */}
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['normal_user']} />}>
          <Route path="/dashboard" element={<UserLayout/>}>
            {/* <Route index element={<UserHome/>} /> */}
            {/* user routes */}
          </Route>
        </Route>

        
        {/* <Route path="*" element={<NotFound/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
