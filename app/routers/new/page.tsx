import { redirect } from "next/navigation";

export default function NewRouterPage() {
  redirect("/cats/new");
}
