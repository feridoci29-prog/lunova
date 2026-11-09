import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/lunova/AuthForm";
import { AuthLayout } from "@/components/lunova/AuthLayout";
export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — Draftwink" },
      { name: "description", content: "Make room for your next idea. Create a Draftwink account." },
    ],
  }),
  component: () => (
    <AuthLayout mode="signup">
      <AuthForm mode="signup" />
    </AuthLayout>
  ),
});
