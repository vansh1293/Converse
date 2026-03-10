import Peer from 'simple-peer';

export default function TestPeer() {
    useEffect(() => {
      const peer = new Peer({ initiator: true });
      peer.on('signal', data => console.log('Signal:', data));
      return () => peer.destroy();
    }, []);
    
    return <div>Test Peer</div>;
  }