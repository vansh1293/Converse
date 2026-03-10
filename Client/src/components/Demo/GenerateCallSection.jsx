import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { PhoneOff, VideoOff, MicOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { endCall, generateCall } from "@/redux/slice/callSlice";
import Peer from 'simple-peer';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";

export default function GenerateCallSection({ id }) {
  // const toast = useToast();
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const { callerData, answerOffer } = useSelector((state) => state.call);
  // const [myVideo, setMyVideo] = useState(null);
  // const [remoteVideo, setRemoteVideo] = useState(null);
  // const mainVideoRef = useRef(null);
  // const overlayVideoRef = useRef(null);
  // const peerRef = useRef(null); // Reference to SimplePeer instance

  // const handleEndCall = () => {
  //   if (myVideo) {
  //     myVideo.getTracks().forEach((track) => {
  //       track.enabled = false;
  //       track.stop();
  //     });
  //     setMyVideo(null);
  //   }
  //   if (mainVideoRef.current) {
  //     mainVideoRef.current.srcObject = null;
  //   }
  //   if (overlayVideoRef.current) {
  //     overlayVideoRef.current.srcObject = null;
  //   }
  //   if (peerRef.current) {
  //     peerRef.current.destroy();
  //     peerRef.current = null;
  //   }
  //   dispatch(endCall({ toast, navigate }));
  // };

  // const handleCallUser = useCallback(async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });
  
  //     // Validate media stream
  //     if (!stream || stream.getVideoTracks().length === 0) {
  //       throw new Error('Camera access denied');
  //     }
  
  //     // 3. Verify peer initialization
  //     const peer = new Peer({
  //       initiator: true,
  //       trickle: true, // Switch to true for better NAT traversal
  //       stream: stream,
  //       config: {
  //         iceServers: [
  //           { urls: 'stun:stun.l.google.com:19302' },
  //           { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
  //         ]
  //       }
  //     });
  
  //     // 4. Add connection state handlers
  //     peer.on('connect', () => {
  //       console.log('Peer connection established');
  //     });
  
  //     peer.on('error', err => {
  //       console.error('Peer connection error:', err);
  //       toast({ title: 'Connection failed', variant: 'destructive' });
  //     });
  
  //     peerRef.current = peer;
  //   } catch (err) {
  //     console.error("Media initialization failed:", err);
  //     toast({ 
  //       title: "Camera/microphone access required",
  //       description: "Please check your device permissions",
  //       variant: "destructive" 
  //     });
  //   }
  // },[dispatch, id]);

  // useEffect(() => {
  //   if (answerOffer && peerRef.current) {
  //     peerRef.current.signal(answerOffer);
  //   }
  // }, [answerOffer]);

  // useEffect(() => {
  //   handleCallUser();
  //   return () => {
  //     handleEndCall();
  //   };
  // }, []);

  // return (
  //   <div className="flex items-center justify-center h-full w-full">
  //     <Card className="rounded-none w-full h-full relative overflow-hidden">
  //       <CardHeader className="text-center py-4">
  //         <CardTitle>{callerData.fullName?callerData.fullname:"user"}</CardTitle>
  //         <CardDescription>Video Call</CardDescription>
  //       </CardHeader>
  //       <Separator />
  //       <CardContent className="flex justify-center items-center p-4">
  //         {/* Video Container */}
  //         <div className="w-full h-[calc(100vh-25vh)] max-w-4xl relative rounded-xl overflow-hidden">
  //           {remoteVideo ? (
  //             <video
  //               ref={mainVideoRef}
  //               autoPlay
  //               playsInline
  //               className="absolute top-0 left-0 w-full h-full"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
  //               Waiting for response...
  //             </div>
  //           )}
  //         </div>
  //         {/* Smaller Video - Overlay */}
  //         <div className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-lg overflow-hidden shadow-lg border bg-black">
  //           {myVideo && (
  //             <video
  //               ref={overlayVideoRef}
  //               autoPlay
  //               playsInline
  //               className="w-full h-full"
  //             />
  //           )}
  //         </div>
  //       </CardContent>
  //       <CardFooter className="flex justify-center gap-6 items-center py-4 px-6">
  //         <Toggle
  //           variant="outline"
  //           onClick={() =>
  //             myVideo
  //               ?.getVideoTracks()
  //               .forEach((track) => (track.enabled = !track.enabled))
  //           }
  //         >
  //           <VideoOff />
  //         </Toggle>
  //         <Button
  //           variant="outline"
  //           className="bg-red-700"
  //           onClick={handleEndCall}
  //         >
  //           <PhoneOff />
  //         </Button>
  //         <Toggle
  //           variant="outline"
  //           onClick={() =>
  //             myVideo
  //               ?.getAudioTracks()
  //               .forEach((track) => (track.enabled = !track.enabled))
  //           }
  //         >
  //           <MicOff />
  //         </Toggle>
  //       </CardFooter>
  //     </Card>
  //   </div>
  // );


  useEffect(() => {
        const peer = new Peer({ initiator: true });
        peer.on('signal', data => console.log('Signal:', data));
        return () => peer.destroy();
      }, []);
  return (
          <div className="flex items-center justify-center h-full w-full">
            test
            </div>
  );
}
