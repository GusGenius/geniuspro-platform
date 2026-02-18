import { CatForm } from "@/components/cats/cat-form";

export default function NewCatPage() {
  return (
    <CatForm
      mode="create"
      backHref="/cats"
      backLabel="Back to Cats"
    />
  );
}

