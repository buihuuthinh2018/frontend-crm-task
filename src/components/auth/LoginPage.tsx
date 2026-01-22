import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // Decode JWT token to get user info (in production, verify this on backend)
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      setUser(
        {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        },
        credentialResponse.credential
      );
      
      navigate('/dashboard');
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            CRM Task Management
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
          />
        </CardContent>
      </Card>
    </div>
  );
}
