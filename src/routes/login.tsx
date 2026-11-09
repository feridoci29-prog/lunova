import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/lunova/AuthForm";
import { AuthLayout } from "@/components/lunova/AuthLayout";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Draftwink" },
      { name: "description", content: "Welcome back to your next draft." },
    ],
  }),
  component: () => (
    <AuthLayout mode="login">
      <AuthForm mode="login" />
    </AuthLayout>
  ),
});
