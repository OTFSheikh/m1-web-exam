import { createFileRoute } from "@tanstack/react-router";
import { BikeDetailsPage } from "../../bikes/pages/BikeDetailsPage";

export const Route = createFileRoute("/bikes/$bikeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { bikeId } = Route.useParams();
  return <BikeDetailsPage bikeId={bikeId} />;
}
