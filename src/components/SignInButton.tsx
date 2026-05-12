import { useAuth } from '../hooks/useAuth';
import './SignInButton.css';

export function SignInButton() {
  const { user, ready, enabled, signIn, signOut } = useAuth();
  if (!enabled || !ready) return null;

  if (user) {
    return (
      <button
        type="button"
        className="signin"
        onClick={() => void signOut()}
        title={user.email ?? user.displayName ?? 'Signed in'}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      className="signin"
      onClick={() => void signIn()}
    >
      Sign in
    </button>
  );
}
