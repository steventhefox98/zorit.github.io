import { useMutation } from "@tanstack/react-query";

// Simple in-memory user store for local auth (no backend auth methods available)
const userStore = new Map<string, string>();

export function useRegister() {
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }): Promise<boolean> => {
      if (userStore.has(username.toLowerCase())) return false;
      userStore.set(username.toLowerCase(), password);
      return true;
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }): Promise<boolean> => {
      const stored = userStore.get(username.toLowerCase());
      return stored === password;
    },
  });
}
