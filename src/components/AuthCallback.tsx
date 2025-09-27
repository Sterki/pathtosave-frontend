import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(errorDescription || "Error en la autenticación");
          return;
        }

        // Manejar el callback de Supabase
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setStatus("error");
          setMessage("Error al verificar la sesión");
          return;
        }

        if (data.session) {
          setStatus("success");
          setMessage("¡Email confirmado exitosamente!");

          // Limpiar la URL después de un breve delay
          setTimeout(() => {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }, 2000);
        } else {
          setStatus("error");
          setMessage("No se pudo confirmar el email");
        }
      } catch (error) {
        console.error("Error en callback de autenticación:", error);
        setStatus("error");
        setMessage("Error inesperado");
      }
    };

    handleAuthCallback();
  }, []);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className='h-8 w-8 animate-spin text-blue-500' />;
      case "success":
        return <CheckCircle className='h-8 w-8 text-green-500' />;
      case "error":
        return <XCircle className='h-8 w-8 text-red-500' />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Verificando...";
      case "success":
        return "¡Éxito!";
      case "error":
        return "Error";
    }
  };

  const getDescription = () => {
    switch (status) {
      case "loading":
        return "Procesando la confirmación de tu email...";
      case "success":
        return message;
      case "error":
        return message;
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>{getIcon()}</div>
          <CardTitle className='text-2xl font-bold'>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && user && (
            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-4'>
                Bienvenido, {user.email}
              </p>
              <p className='text-xs text-muted-foreground'>
                Serás redirigido automáticamente...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-4'>
                Intenta registrarte nuevamente o contacta al soporte.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className='text-sm text-blue-500 hover:underline'
              >
                Volver al inicio
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
