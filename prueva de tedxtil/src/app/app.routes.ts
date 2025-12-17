import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { AdminGuard } from './core/guards/admin-guard';
import { GuestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  // RUTAS PÚBLICAS (Usuarios/Clientes)
  {
    path: '',
    loadComponent: () => import('./layout/public-layout/public-layout')
      .then(m => m.PublicLayout),
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      // Página principal de la tienda
      {
        path: 'home',
        loadComponent: () => import('./features/public/home/home')
          .then(m => m.Home),
        title: 'Inicio - Mi Tienda'
      },
      
      // AUTENTICACIÓN DE USUARIOS (Solo para no autenticados)
      {
        path: 'auth',
        canActivate: [GuestGuard],
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/public/auth/login/login')
              .then(m => m.Login),
            title: 'Iniciar Sesión'
          },
          {
            path: 'register',
            loadComponent: () => import('./features/public/auth/register/register')
              .then(m => m.Register),
            title: 'Crear Cuenta'
          },
         
          {
            path: '',
            redirectTo: 'login',
            pathMatch: 'full'
          }
        ]
      },

      // TIENDA/CATÁLOGO
      {
        path: 'shop',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/public/shop/product-list/product-list')
              .then(m => m.ProductList),
            title: 'Catálogo de Productos'
          },
          {
            path: 'product/:id',
            loadComponent: () => import('./features/public/shop/product-list/product-list')
              .then(m => m.ProductList),
            title: 'Detalle del Producto'
          },
      
       
        ]
      },

      // CARRITO DE COMPRAS
      {
        path: 'cart',
        loadComponent: () => import('./features/public/cart/cart')
          .then(m => m.Cart),
        title: 'Carrito de Compras'
      },

      // PROCESO DE COMPRA (Requiere autenticación)
      {
        path: 'checkout',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'shipping',
            pathMatch: 'full'
          },
         
          
        ]
      },

      // PERFIL DEL USUARIO (Requiere autenticación)
      {
        path: 'profile',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'account',
            pathMatch: 'full'
          },
          
        ]
      }
    ]
  },

  // RUTAS DE ADMINISTRACIÓN
  {
    path: 'admin',
    children: [
      // Login del administrador (Solo para no autenticados como admin)
      {
        path: 'login',
        canActivate: [GuestGuard],
        loadComponent: () => import('./features/admin/auth/admin-login/admin-login')
          .then(m => m.AdminLogin),
        title: 'Login Administrador'
      },
      
      // Panel de administración (Requiere ser admin)
      {
        path: '',
      
        loadComponent: () => import('./layout/admin-layout/admin-layout')
          .then(m => m.AdminLayout),
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          
          // Dashboard principal
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/dashboard')
              .then(m => m.Dashboard),
            title: 'Panel de Control'
          },

          // GESTIÓN DE PRODUCTOS
          {
            path: 'products',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/admin/products/product-list/product-list')
                  .then(m => m.ProductList),
                title: 'Gestión de Productos'
              },
         
            ]
          },

          // GESTIÓN DE PEDIDOS
          {
            path: 'orders',
            children: [
            
            ]
          },

          // GESTIÓN DE USUARIOS
          {
            path: 'users',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/admin/users/user-list/user-list')
                  .then(m => m.UserList),
                title: 'Gestión de Usuarios'
              },
          
            ]
          },

          // GESTIÓN DE CATEGORÍAS
          

          // REPORTES Y ESTADÍSTICAS
          {
            path: 'reports',
            children: [
              {
                path: '',
                redirectTo: 'sales',
                pathMatch: 'full'
              },
            
            ]
          },

          // CONFIGURACIONES DEL SISTEMA
          {
            path: 'settings',
            children: [
              {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
              },


            ]
          }
        ]
      }
    ]
  },

  // RUTAS DE ERROR Y PÁGINAS ESPECIALES
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized')
      .then(m => m.Unauthorized),
    title: 'Acceso No Autorizado'
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found')
      .then(m => m.NotFound),
    title: 'Página No Encontrada'
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./shared/components/maintenance/maintenance')
      .then(m => m.Maintenance),
    title: 'Sitio en Mantenimiento'
  },

 
];