import { BikeDetails } from "../components/BikeDetails";

interface BikeDetailsPageProps {
  bikeId: string;
}

export const BikeDetailsPage = ({ bikeId }: BikeDetailsPageProps) => {
  return <BikeDetails bikeId={bikeId} />;
};
