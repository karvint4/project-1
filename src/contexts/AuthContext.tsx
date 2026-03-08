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

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  serverId: string;
  serverName: string;
  serverType: "user" | "worker";
  roomNumber?: string;
  floorNumber?: string;
  workerRole?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface FamilyMember {
  name: string;
  age: string;
  mobile: string;
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
  familyMembers?: FamilyMember[];
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
  getPendingJoinRequests: (serverId: string) => JoinRequest[];
  acceptJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  updateUserFamilyMembers: (userId: string, familyMembers: FamilyMember[]) => void;
  getUserJoinRequestStatus: (userId: string) => JoinRequest | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'communityfix_users',
  CURRENT_USER: 'communityfix_current_user',
  APARTMENTS: 'communityfix_apartments',
  ISSUES: 'communityfix_issues',
  PAYMENT_PROFILES: 'communityfix_payment_profiles',
  JOIN_REQUESTS: 'communityfix_join_requests'
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
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => 
    loadFromStorage(STORAGE_KEYS.JOIN_REQUESTS, [])
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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.JOIN_REQUESTS, joinRequests);
  }, [joinRequests]);

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
    const server = Object.values(apartmentServers).find(s => s.code === code && s.serverType === "user");
    if (server && user) {
      const request: JoinRequest = {
        id: "req_" + Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userMobile: user.mobile,
        serverId: server.id,
        serverName: server.name,
        serverType: "user",
        roomNumber,
        floorNumber,
        status: "pending",
        createdAt: new Date()
      };
      setJoinRequests(prev => [...prev, request]);
      return true;
    }
    return false;
  };

  const joinWorkerServerByCode = (code: string, workerRole: string): boolean => {
    const server = Object.values(apartmentServers).find(s => s.code === code && s.serverType === "worker");
    if (server && user) {
      const request: JoinRequest = {
        id: "req_" + Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userMobile: user.mobile,
        serverId: server.id,
        serverName: server.name,
        serverType: "worker",
        workerRole,
        status: "pending",
        createdAt: new Date()
      };
      setJoinRequests(prev => [...prev, request]);
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

  const getPendingJoinRequests = (serverId: string): JoinRequest[] => {
    return joinRequests.filter(req => req.serverId === serverId && req.status === "pending");
  };

  const acceptJoinRequest = (requestId: string): void => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) return;

    setJoinRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: "accepted" as const } : req
    ));

    const userEmail = request.userEmail;
    if (registeredUsers[userEmail]) {
      if (request.serverType === "user") {
        const updatedUser = {
          ...registeredUsers[userEmail],
          apartmentServerId: request.serverId,
          apartmentName: request.serverName,
          roomNumber: request.roomNumber,
          floorNumber: request.floorNumber
        };
        setRegisteredUsers(prev => ({ ...prev, [userEmail]: updatedUser }));
        if (user?.email === userEmail) {
          const { password: _, ...userWithoutPassword } = updatedUser;
          setUser(userWithoutPassword);
        }
      } else {
        const updatedUser = {
          ...registeredUsers[userEmail],
          workerServerId: request.serverId,
          apartmentName: request.serverName,
          workerRole: request.workerRole
        };
        setRegisteredUsers(prev => ({ ...prev, [userEmail]: updatedUser }));
        if (user?.email === userEmail) {
          const { password: _, ...userWithoutPassword } = updatedUser;
          setUser(userWithoutPassword);
        }
      }
    }
  };

  const rejectJoinRequest = (requestId: string): void => {
    setJoinRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: "rejected" as const } : req
    ));
  };

  const updateUserFamilyMembers = (userId: string, familyMembers: FamilyMember[]): void => {
    const userEmail = Object.values(registeredUsers).find(u => u.id === userId)?.email;
    if (userEmail && registeredUsers[userEmail]) {
      const updatedUser = { ...registeredUsers[userEmail], familyMembers };
      setRegisteredUsers(prev => ({ ...prev, [userEmail]: updatedUser }));
      if (user?.id === userId) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        setUser(userWithoutPassword);
      }
    }
  };

  const getUserJoinRequestStatus = (userId: string): JoinRequest | null => {
    return joinRequests.find(req => req.userId === userId && req.status === "pending") || null;
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
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, getApartmentCode, createApartmentServer, joinApartmentByCode, joinWorkerServerByCode, getApartmentServers, getServerMembers, getWorkersByRole, deleteApartmentServer, getUserIssues, addIssue, canAddIssue, getAllIssues, updateIssueStatus, assignWorkerToIssue, savePaymentProfile, getPaymentProfile, sendPaymentDetails, markPaymentComplete, getPendingJoinRequests, acceptJoinRequest, rejectJoinRequest, updateUserFamilyMembers, getUserJoinRequestStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
