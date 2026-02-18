"use client";

import { RouterForm } from "@/components/routers/router-form";

export default function NewRouterPage() {
  return (
    <RouterForm
      mode="create"
      initialData={{
        name: "",
        slug: "",
        instructions: "",
        model_ids: ["gemini-3-flash"],
      }}
      backHref="/routers"
      backLabel="Back to Routers"
    />
  );
}
