import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react";

export const Auth: React.FC = () => {
  const { signUp, signIn, resendConfirmation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      if (data.user && !data.user.email_confirmed_at) {
        setEmailToConfirm(email);
        setSuccess(
          "¡Cuenta creada exitosamente! Revisa tu email y haz clic en el enlace de confirmación para activar tu cuenta."
        );
      } else {
        setSuccess("¡Cuenta creada exitosamente!");
      }
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      if (
        error.message.includes("email_not_confirmed") ||
        error.message.includes("Email not confirmed")
      ) {
        setError(
          "Tu email no ha sido confirmado. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación, o solicita un nuevo email."
        );
        setEmailToConfirm(email);
      } else {
        setError(error.message);
      }
    }

    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!emailToConfirm) return;

    setIsLoading(true);
    setError(null);

    const { error } = await resendConfirmation(emailToConfirm);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(
        "¡Email de confirmación reenviado! Revisa tu bandeja de entrada."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Gestor de Gastos</CardTitle>
          <CardDescription>
            Inicia sesión o crea una cuenta para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='signin' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='signin'>Iniciar Sesión</TabsTrigger>
              <TabsTrigger value='signup'>Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value='signin'>
              <form onSubmit={handleSignIn} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signin-email'>Email</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='signin-email'
                      name='email'
                      type='email'
                      placeholder='tu@email.com'
                      className='pl-10'
                      required
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signin-password'>Contraseña</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='signin-password'
                      name='password'
                      type='password'
                      placeholder='••••••••'
                      className='pl-10'
                      required
                    />
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className='mr-2 h-4 w-4' />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='signup'>
              <form onSubmit={handleSignUp} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signup-email'>Email</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='signup-email'
                      name='email'
                      type='email'
                      placeholder='tu@email.com'
                      className='pl-10'
                      required
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-password'>Contraseña</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='signup-password'
                      name='password'
                      type='password'
                      placeholder='••••••••'
                      className='pl-10'
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-confirm-password'>
                    Confirmar Contraseña
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='signup-confirm-password'
                      name='confirmPassword'
                      type='password'
                      placeholder='••••••••'
                      className='pl-10'
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus className='mr-2 h-4 w-4' />
                      Crear Cuenta
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant='destructive' className='mt-4'>
              <AlertDescription>{error}</AlertDescription>
              {emailToConfirm &&
                (error.includes("email_not_confirmed") ||
                  error.includes("Email not confirmed")) && (
                  <div className='mt-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className='w-full'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Reenviando...
                        </>
                      ) : (
                        <>
                          <Mail className='mr-2 h-4 w-4' />
                          Reenviar email de confirmación
                        </>
                      )}
                    </Button>
                  </div>
                )}
            </Alert>
          )}

          {success && (
            <Alert className='mt-4'>
              <AlertDescription>{success}</AlertDescription>
              {emailToConfirm && (
                <div className='mt-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleResendConfirmation}
                    disabled={isLoading}
                    className='w-full'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <Mail className='mr-2 h-4 w-4' />
                        Reenviar email de confirmación
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
