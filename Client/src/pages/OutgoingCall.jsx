import { useParams } from "react-router-dom";
import GenerateCallSection from "@/components/Demo/GenerateCallSection";
export default function OutgoingCall() {
  const { id } = useParams();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
             <GenerateCallSection id={id} />
        </div>
    );
}
