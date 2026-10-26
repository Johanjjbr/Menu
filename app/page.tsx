import { redirect } from "next/navigation";

/** La raíz del sitio lleva directo a la carta. */
export default function Home() {
  redirect("/menu");
}
