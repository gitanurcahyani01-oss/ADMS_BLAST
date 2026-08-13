import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adms_auth_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adms_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const saved = localStorage.getItem('adms_auth_workspace');
    return saved ? JSON.parse(saved) : null;
  });
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('adms_auth_workspaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('adms_auth_permissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(true);
  const [revokedMessage, setRevokedMessage] = useState(null);

  // Synchronize session on mount & token changes
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const userData = data.data.user;
          const currentWs = data.data.activeWorkspace;
          const userWorkspaces = data.data.workspaces || [];
          const userPerms = data.data.permissions || [];

          setUser(userData);
          setActiveWorkspace(currentWs);
          setWorkspaces(userWorkspaces);
          setPermissions(userPerms);

          localStorage.setItem('adms_auth_user', JSON.stringify(userData));
          if (currentWs) localStorage.setItem('adms_auth_workspace', JSON.stringify(currentWs));
          localStorage.setItem('adms_auth_workspaces', JSON.stringify(userWorkspaces));
          localStorage.setItem('adms_auth_permissions', JSON.stringify(userPerms));
        } else {
          if (data.code === 'ACCOUNT_REVOKED') {
            setRevokedMessage(data.message || 'Akses akun Anda telah dicabut oleh Super Admin.');
          }
          logout();
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          code: result.code,
          message: result.message || 'Login gagal. Periksa kembali email dan password Anda.',
        };
      }

      const { token: jwtToken, user: userData, activeWorkspace: currentWs, workspaces: userWorkspaces, permissions: userPerms } = result.data;
      
      setToken(jwtToken);
      setUser(userData);
      setActiveWorkspace(currentWs);
      setWorkspaces(userWorkspaces || []);
      setPermissions(userPerms || []);

      localStorage.setItem('adms_auth_token', jwtToken);
      localStorage.setItem('adms_auth_user', JSON.stringify(userData));
      if (currentWs) localStorage.setItem('adms_auth_workspace', JSON.stringify(currentWs));
      localStorage.setItem('adms_auth_workspaces', JSON.stringify(userWorkspaces || []));
      localStorage.setItem('adms_auth_permissions', JSON.stringify(userPerms || []));
      setRevokedMessage(null);

      return { success: true, user: userData, activeWorkspace: currentWs };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server backend. Pastikan server database & API aktif.',
      };
    }
  };

  const register = async ({ name, email, password, companyName, phone }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, phone }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          code: result.code,
          message: result.message || 'Pendaftaran gagal.',
        };
      }

      const { token: jwtToken, user: userData, activeWorkspace: currentWs, workspaces: userWorkspaces, permissions: userPerms } = result.data;

      setToken(jwtToken);
      setUser(userData);
      setActiveWorkspace(currentWs);
      setWorkspaces(userWorkspaces || []);
      setPermissions(userPerms || []);

      localStorage.setItem('adms_auth_token', jwtToken);
      localStorage.setItem('adms_auth_user', JSON.stringify(userData));
      if (currentWs) localStorage.setItem('adms_auth_workspace', JSON.stringify(currentWs));
      localStorage.setItem('adms_auth_workspaces', JSON.stringify(userWorkspaces || []));
      localStorage.setItem('adms_auth_permissions', JSON.stringify(userPerms || []));

      return { success: true, user: userData, activeWorkspace: currentWs };
    } catch (err) {
      console.error('Register error:', err);
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server backend.',
      };
    }
  };

  const switchWorkspace = async (workspaceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/switch-workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setActiveWorkspace(result.data.activeWorkspace);
        localStorage.setItem('adms_auth_workspace', JSON.stringify(result.data.activeWorkspace));
        return { success: true, activeWorkspace: result.data.activeWorkspace };
      }
      return { success: false, message: result.message };
    } catch (err) {
      console.error('Switch workspace error:', err);
      return { success: false, message: 'Gagal beralih workspace.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
      setPermissions([]);
      localStorage.removeItem('adms_auth_token');
      localStorage.removeItem('adms_auth_user');
      localStorage.removeItem('adms_auth_workspace');
      localStorage.removeItem('adms_auth_workspaces');
      localStorage.removeItem('adms_auth_permissions');
    }
  };

  // Helper auth fetch wrapper
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url.startsWith('http') ? url : `${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 403 && data.code === 'ACCOUNT_REVOKED') {
      setRevokedMessage(data.message || 'Akses akun Anda telah dicabut oleh Super Admin.');
      logout();
      window.location.href = '/login?revoked=1';
    }

    return { response, data, ok: response.ok };
  };

  // Role Checks
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';
  const isAuthenticated = !!token && !!user && user.status === 'ACTIVE';

  // Permission Checks (Super Admin passes all)
  const hasPermission = (permissionCode) => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permCodes = []) => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permCodes.some((code) => permissions.includes(code));
  };

  const hasAllPermissions = (permCodes = []) => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permCodes.every((code) => permissions.includes(code));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      activeWorkspace,
      workspaces,
      permissions,
      loading,
      isAuthenticated,
      isSuperAdmin,
      isAdmin,
      isUser,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      switchWorkspace,
      login,
      register,
      logout,
      authFetch,
      revokedMessage,
      setRevokedMessage,
      API_BASE_URL,
    }),
    [token, user, activeWorkspace, workspaces, permissions, loading, isAuthenticated, isSuperAdmin, isAdmin, isUser, revokedMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
