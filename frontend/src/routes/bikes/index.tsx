import { createFileRoute } from "@tanstack/react-router";
import { BikesPage } from "../../bikes/pages/BikesPage";

export const Route = createFileRoute("/bikes/")({
  component: BikesPage,
});
