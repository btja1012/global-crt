export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "No autorizado",
      description: "Debe iniciar sesión para acceder al panel.",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
}
