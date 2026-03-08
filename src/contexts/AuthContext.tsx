import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "user" | "admin" | "worker";

export interface ApartmentServer {
  id: string;
  name: string;
  address: string;
  description: string;
  code: string;
  link: string;
  adminId: string;
  adminName: string;
  serverType: "user" | "worker";
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  apartmentName: string;
  roomNumber?: string;
  floorNumber?: string;
  apartmentServerId?: string;
  workerServerId?: string;
  workerRole?: string;
}

interface StoredUser extends UserProfile {
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  signup: (name: string, email: string, password: string, mobile: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  getApartmentCode: () => string;
  createApartmentServer: (name: string, address: string, description: string, serverType: "user" | "worker") => ApartmentServer;
  joinApartmentByCode: (code: string, roomNumber: string, floorNumber: string) => boolean;
  joinWorkerServerByCode: (code: string, workerRole: string) => boolean;
  getApartmentServers: () => ApartmentServer[];
  getServerMembers: (serverId: string) => UserProfile[];
  getWorkersByRole: (serverId: string) => Record<string, UserProfile[]>;
  deleteApartmentServer: (serverId: string) => void;
  getUserIssues: (userId: string) => any[];
  addIssue: (issue: any) => boolean;
  canAddIssue: (userId: string) => boolean;
  getAllIssues: () => any[];
  updateIssueStatus: (issueId: string, status: string) => void;
  assignWorkerToIssue: (issueId: string, workerId: string) => void;
  savePaymentProfile: (userId: string, profile: any) => void;
  getPaymentProfile: (userId: string) => any;
  sendPaymentDetails: (issueId: string, details: any) => void;
  markPaymentComplete: (issueId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'communityfix_users',
  CURRENT_USER: 'communityfix_current_user',
  APARTMENTS: 'communityfix_apartments',
  ISSUES: 'communityfix_issues',
  PAYMENT_PROFILES: 'communityfix_payment_profiles'
};

const mockUsers: Record<string, StoredUser> = {
  "user@demo.com": {
    id: "u1",
    name: "Rahul Sharma",
    email: "user@demo.com",
    mobile: "+91 98765 43210",
    role: "user",
    apartmentName: "Sunrise Heights",
    roomNumber: "304",
    floorNumber: "3",
    password: "demo123"
  },
  "admin@demo.com": {
    id: "a1",
    name: "Priya Patel",
    email: "admin@demo.com",
    mobile: "+91 91234 56789",
    role: "admin",
    apartmentName: "Sunrise Heights",
    password: "admin123"
  },
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => 
    loadFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, StoredUser>>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.USERS, {});
    return { ...mockUsers, ...stored };
  });
  const [apartmentServers, setApartmentServers] = useState<Record<string, ApartmentServer>>(() => 
    loadFromStorage(STORAGE_KEYS.APARTMENTS, {})
  );
  const [issues, setIssues] = useState<any[]>(() => 
    loadFromStorage(STORAGE_KEYS.ISSUES, [])
  );
  const [paymentProfiles, setPaymentProfiles] = useState<Record<string, any>>(() => 
    loadFromStorage(STORAGE_KEYS.PAYMENT_PROFILES, {})
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  }, [user]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, registeredUsers);
  }, [registeredUsers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APARTMENTS, apartmentServers);
  }, [apartmentServers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ISSUES, issues);
  }, [issues]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PAYMENT_PROFILES, paymentProfiles);
  }, [paymentProfiles]);

  const login = (email: string, password: string, role: UserRole): boolean => {
    console.log('Login attempt:', email, 'Role:', role);
    console.log('Available users:', Object.keys(registeredUsers));
    
    const registeredUser = registeredUsers[email];
    console.log('Found user:', registeredUser);
    
    if (registeredUser && registeredUser.password === password && registeredUser.role === role) {
      const { password: _, ...userWithoutPassword } = registeredUser;
      setUser(userWithoutPassword);
      return true;
    }

    return false;
  };

  const signup = (name: string, email: string, password: string, mobile: string, role: UserRole): boolean => {
    if (registeredUsers[email]) {
      return false;
    }

    const newUser: StoredUser = {
      id: "u" + Date.now(),
      name,
      email,
      mobile,
      role,
      apartmentName: "",
      password,
    };

    setRegisteredUsers(prev => ({ ...prev, [email]: newUser }));
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    return true;
  };

  const createApartmentServer = (name: string, address: string, description: string, serverType: "user" | "worker"): ApartmentServer => {
    const code = generateServerCode();
    const serverId = (serverType === "worker" ? "wrk_" : "apt_") + Date.now().toString(36);
    const link = `https://communityfix.app/join/${serverId}`;
    
    const server: ApartmentServer = {
      id: serverId,
      name,
      address,
      description,
      code,
      link,
      adminId: user?.id || "",
      adminName: user?.name || "",
      serverType,
      createdAt: new Date()
    };
    
    setApartmentServers(prev => ({ ...prev, [serverId]: server }));
    return server;
  };

  const joinApartmentByCode = (code: string, roomNumber: string, floorNumber: string): boolean => {
    console.log('Searching for code:', code);
    console.log('Available servers:', apartmentServers);
    const server = Object.values(apartmentServers).find(s => s.code === code);
    console.log('Found server:', server);
    if (server && user) {
      const updatedUser = { 
        ...user, 
        apartmentServerId: server.id, 
        apartmentName: server.name,
        roomNumber,
        floorNumber
      };
      setUser(updatedUser);
      if (registeredUsers[user.email]) {
        setRegisteredUsers(prev => ({
          ...prev,
          [user.email]: { ...prev[user.email], ...updatedUser }
        }));
      }
      return true;
    }
    return false;
  };

  const joinWorkerServerByCode = (code: string, workerRole: string): boolean => {
    const server = Object.values(apartmentServers).find(s => s.code === code && s.serverType === "worker");
    if (server && user) {
      const updatedUser = { 
        ...user, 
        workerServerId: server.id, 
        apartmentName: server.name,
        workerRole
      };
      setUser(updatedUser);
      if (registeredUsers[user.email]) {
        setRegisteredUsers(prev => ({
          ...prev,
          [user.email]: { ...prev[user.email], ...updatedUser }
        }));
      }
      return true;
    }
    return false;
  };

  const getApartmentServers = (): ApartmentServer[] => {
    return Object.values(apartmentServers);
  };

  const getServerMembers = (serverId: string): UserProfile[] => {
    const allUsers = Object.values(registeredUsers).map(({ password, ...user }) => user);
    return allUsers.filter(u => u.apartmentServerId === serverId || u.workerServerId === serverId);
  };

  const getWorkersByRole = (serverId: string): Record<string, UserProfile[]> => {
    const allUsers = Object.values(registeredUsers).map(({ password, ...user }) => user);
    const workers = allUsers.filter(u => u.workerServerId === serverId && u.role === "worker");
    
    const grouped: Record<string, UserProfile[]> = {};
    workers.forEach(worker => {
      const role = worker.workerRole || "unassigned";
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push(worker);
    });
    
    return grouped;
  };

  const deleteApartmentServer = (serverId: string): void => {
    setApartmentServers(prev => {
      const updated = { ...prev };
      delete updated[serverId];
      return updated;
    });
  };

  const getUserIssues = (userId: string): any[] => {
    return issues.filter(issue => issue.createdBy === userId && issue.status !== 'completed');
  };

  const canAddIssue = (userId: string): boolean => {
    const userIssues = getUserIssues(userId);
    return userIssues.length < 3;
  };

  const addIssue = (issue: any): boolean => {
    if (!canAddIssue(issue.createdBy)) {
      return false;
    }
    setIssues(prev => [...prev, issue]);
    return true;
  };

  const getAllIssues = (): any[] => {
    return issues;
  };

  const updateIssueStatus = (issueId: string, status: string): void => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status } : issue
    ));
  };

  const assignWorkerToIssue = (issueId: string, workerId: string): void => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, assignedWorkerId: workerId, status: "started" } : issue
    ));
  };

  const savePaymentProfile = (userId: string, profile: any): void => {
    setPaymentProfiles(prev => ({ ...prev, [userId]: profile }));
  };

  const getPaymentProfile = (userId: string): any => {
    return paymentProfiles[userId] || null;
  };

  const sendPaymentDetails = (issueId: string, details: any): void => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, paymentDetails: details, paymentSent: true } : issue
    ));
  };

  const markPaymentComplete = (issueId: string): void => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, paymentCompleted: true, status: "verified" } : issue
    ));
  };

  const generateServerCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getApartmentCode = (): string => {
    if (user?.role === 'admin' && user.apartmentServerId) {
      return apartmentServers[user.apartmentServerId]?.code || '';
    }
    return '';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, getApartmentCode, createApartmentServer, joinApartmentByCode, joinWorkerServerByCode, getApartmentServers, getServerMembers, getWorkersByRole, deleteApartmentServer, getUserIssues, addIssue, canAddIssue, getAllIssues, updateIssueStatus, assignWorkerToIssue, savePaymentProfile, getPaymentProfile, sendPaymentDetails, markPaymentComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
