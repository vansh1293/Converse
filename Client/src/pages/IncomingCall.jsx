// File: OutgoingCall copy.jsx
import { useParams } from "react-router-dom";
import IncomingCallSection from "@/components/Demo/IncomingCallSection";
export default function IncomingCall() {

    const { id } = useParams();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
           <IncomingCallSection  id={id}/>
        </div>
    );
}
