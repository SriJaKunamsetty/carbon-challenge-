/**
 * @module AuthContext Tests
 * Tests for the AuthContext provider that manages authentication state.
 */
import { vi } from 'vitest';
import React from 'react';
import { render, screen, act, waitFor, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────
// vi.hoisted ensures these are available when vi.mock factory functions run

const authMocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn(() => 'docRef'),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn((ref: unknown, callback: (snap: any) => void, onError?: (error: any) => void) => {
    callback({
      exists: () => true,
      data: () => ({
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        points: 100,
        streak: 5,
        goal: 350,
        onboarded: true,
      }),
    });
    return vi.fn();
  }),
}));

const cookieMocks = vi.hoisted(() => ({
  set: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: authMocks.onAuthStateChanged,
  signInWithPopup: authMocks.signInWithPopup,
  GoogleAuthProvider: authMocks.GoogleAuthProvider,
  signInWithEmailAndPassword: authMocks.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: authMocks.createUserWithEmailAndPassword,
  signOut: authMocks.signOut,
  sendPasswordResetEmail: authMocks.sendPasswordResetEmail,
}));

vi.mock('firebase/firestore', () => ({
  doc: firestoreMocks.doc,
  setDoc: firestoreMocks.setDoc,
  updateDoc: firestoreMocks.updateDoc,
  onSnapshot: firestoreMocks.onSnapshot,
}));

vi.mock('js-cookie', () => ({
  default: {
    set: cookieMocks.set,
    remove: cookieMocks.remove,
  },
}));

// ─── Test Components ──────────────────────────────────────────────────────────

const TestComponent = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  return <div>Signed in as {user.displayName}</div>;
};

const AuthActions = () => {
  const authApi = useAuth();
  return (
    <div>
      <button type="button" onClick={() => authApi.loginWithGoogle()}>Google</button>
      <button type="button" onClick={() => authApi.loginWithEmail('a@b.com', 'pass')}>Email</button>
      <button type="button" onClick={() => authApi.signupWithEmail('a@b.com', 'pass', 'Name')}>Signup</button>
      <button type="button" onClick={() => authApi.logout()}>Logout</button>
      <button type="button" onClick={() => authApi.resetPassword('a@b.com')}>Reset</button>
      <button type="button" onClick={() => authApi.updateProfile({ name: 'Updated' })}>Update</button>
      <button type="button" onClick={() => authApi.onboardUser({ country: 'India' } as never)}>Onboard</button>
    </div>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default snapshot mock after clearAllMocks
    firestoreMocks.onSnapshot.mockImplementation((ref: unknown, callback: (snap: unknown) => void) => {
      callback({
        exists: () => true,
        data: () => ({
          uid: '123',
          name: 'Test User',
          email: 'test@example.com',
          points: 100,
          streak: 5,
          goal: 350,
          onboarded: true,
        }),
      });
      return vi.fn();
    });
  });

  it('shows loading state initially', () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('updates state when auth state changes to user', async () => {
    let authCallback: (user: unknown) => void = () => {};
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('token'),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Signed in as Test User')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(cookieMocks.set).toHaveBeenCalledWith('__session', 'token', { expires: 14 });
    });
  });

  it('updates state when auth state changes to null', async () => {
    let authCallback: (user: unknown) => void = () => {};
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback(null);
    });

    expect(screen.getByText('Not signed in')).toBeInTheDocument();
    await waitFor(() => {
      expect(cookieMocks.remove).toHaveBeenCalledWith('__session');
    });
  });

  it('creates a default profile when Firestore document is missing', async () => {
    let authCallback: (user: unknown) => void = () => {};
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return vi.fn();
    });

    firestoreMocks.onSnapshot.mockImplementationOnce((ref: unknown, callback: (snap: unknown) => void) => {
      callback({ exists: () => false, data: () => undefined });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback({
        uid: '123',
        displayName: 'New User',
        email: 'new@example.com',
        photoURL: null,
        getIdToken: vi.fn().mockResolvedValue('token'),
      });
    });

    await waitFor(() => {
      expect(firestoreMocks.setDoc).toHaveBeenCalled();
    });
  });

  it('calls Google sign-in', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signInWithPopup.mockResolvedValue({} as never);

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Google').click();
    });

    expect(authMocks.signInWithPopup).toHaveBeenCalled();
  });

  it('calls email login and signup flows', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signInWithEmailAndPassword.mockResolvedValue({} as never);
    authMocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: '123' },
    } as never);

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Email').click();
    });
    await act(async () => {
      screen.getByText('Signup').click();
    });

    expect(authMocks.signInWithEmailAndPassword).toHaveBeenCalled();
    expect(authMocks.createUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it('logs out and resets password', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signOut.mockResolvedValue(undefined);
    authMocks.sendPasswordResetEmail.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Logout').click();
    });
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(authMocks.signOut).toHaveBeenCalled();
    expect(authMocks.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('updates profile and onboarding data in Firestore', async () => {
    let authCallback: (user: unknown) => void = () => {};
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      authCallback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('token'),
      });
    });

    await act(async () => {
      screen.getByText('Update').click();
    });
    await act(async () => {
      screen.getByText('Onboard').click();
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalled();
  });

  it('throws when useAuth is used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('propagates error when loginWithGoogle fails', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signInWithPopup.mockRejectedValue(new Error('popup-closed'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.loginWithGoogle())
    ).rejects.toThrow('popup-closed');

    expect(authMocks.signInWithPopup).toHaveBeenCalled();
  });

  it('propagates error when loginWithEmail fails', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signInWithEmailAndPassword.mockRejectedValue(new Error('wrong-password'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.loginWithEmail('a@b.com', 'pass'))
    ).rejects.toThrow('wrong-password');

    expect(authMocks.signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('propagates error when logout fails', async () => {
    authMocks.onAuthStateChanged.mockImplementation(() => vi.fn());
    authMocks.signOut.mockRejectedValue(new Error('network-error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.logout())
    ).rejects.toThrow('network-error');

    expect(authMocks.signOut).toHaveBeenCalled();
  });

  it('updateProfile is a no-op when profile is null', async () => {
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: null) => void) => {
      cb(null); // no user → no profile
      return vi.fn();
    });

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Update').click();
    });

    // updateDoc should NOT be called since profile is null
    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled();
  });

  it('handles onSnapshot error gracefully via fallback profile', async () => {
    let authCallback: (user: unknown) => void = () => {};
    authMocks.onAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      authCallback = cb;
      return vi.fn();
    });

    // Make onSnapshot call the error handler
    firestoreMocks.onSnapshot.mockImplementation(
      (_ref: unknown, _cb: unknown, errCb?: (err: Error) => void) => {
        if (errCb) errCb(new Error('permission-denied'));
        return vi.fn();
      }
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('token'),
        photoURL: null,
      });
    });

    // After error, component should show the user (fallback profile loaded)
    await waitFor(() => {
      expect(screen.getByText('Signed in as Test User')).toBeInTheDocument();
    });
  });
});
