import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Bike, BookOpen, ClipboardList, History, LayoutDashboard, Lightbulb, Package, Soup, Star, Tags, User, Warehouse, Wheat } from 'lucide-react';
import PillShell from './layouts/PillShell';
import SidebarShell from './layouts/SidebarShell';
import { GuestOnly, RequireRole } from './routes/Guards';
import Landing from './pages/public/Landing';
import { Login, Register } from './pages/public/Auth';
import Menu from './pages/public/Menu';
import FoodDetail from './pages/public/FoodDetail';
import { About, Contact } from './pages/public/Static';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import { OrderDetail, OrderList } from './pages/customer/Orders';
import { CustomerDashboard, MyReviews, Profile, Suggestions } from './pages/customer/Extras';
import AdminDashboard from './pages/admin/Dashboard';
import { CategoriesPage, FoodsPage, IngredientsPage, RecipesPage } from './pages/admin/Catalogue';
import Inventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/Orders';
import { AdminReviews, AdminSuggestions, Partners } from './pages/admin/People';
import { DeliveryDetail, DeliveryHistory, DeliveryHome } from './pages/delivery/Delivery';

const ADMIN_NAV = [
  { to: '/admin', text: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/admin/foods', text: 'Foods', icon: Soup },
  { to: '/admin/categories', text: 'Categories', icon: Tags }, { to: '/admin/ingredients', text: 'Ingredients', icon: Wheat },
  { to: '/admin/recipes', text: 'Recipes', icon: BookOpen }, { to: '/admin/inventory', text: 'Inventory', icon: Warehouse },
  { to: '/admin/orders', text: 'Orders', icon: Package }, { to: '/admin/partners', text: 'Delivery partners', icon: Bike },
  { to: '/admin/reviews', text: 'Reviews', icon: Star }, { to: '/admin/suggestions', text: 'Suggestions', icon: Lightbulb },
  { to: '/admin/account', text: 'Account', icon: User },
];
const DELIVERY_NAV = [
  { to: '/delivery', text: 'Assigned', icon: ClipboardList, end: true }, { to: '/delivery/history', text: 'History', icon: History },
  { to: '/delivery/account', text: 'Profile', icon: User },
];

export default function App() {
  return (
    <Routes>
      <Route element={<PillShell />}>
        <Route index element={<Landing />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:id" element={<FoodDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="app" element={<RequireRole role="CUSTOMER"><CustomerOutlet /></RequireRole>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="admin" element={<RequireRole role="ADMIN"><SidebarShell items={ADMIN_NAV} area="Restaurant admin" /></RequireRole>}>
        <Route index element={<AdminDashboard />} />
        <Route path="foods" element={<FoodsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="partners" element={<Partners />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="account" element={<Profile />} />
      </Route>
      <Route path="delivery" element={<RequireRole role="DELIVERY_PARTNER"><SidebarShell items={DELIVERY_NAV} area="Delivery partner" /></RequireRole>}>
        <Route index element={<DeliveryHome />} />
        <Route path="history" element={<DeliveryHistory />} />
        <Route path="account" element={<Profile />} />
        <Route path=":id" element={<DeliveryDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
const CustomerOutlet = () => <Outlet />;
