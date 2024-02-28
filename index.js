let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302']
        }
    ]
}


const init = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const user1 = document.getElementById("user1");

    user1.srcObject = localStream;
    createOffer()
  } catch (error) {
    console.log(error);
  }
};

let createOffer = async()=>{
    try{

        peerConnection = new RTCPeerConnection(servers);
        remoteStream = new MediaStream()
        document.getElementById('user2').srcObject = remoteStream

        let offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        console.log('offer:',offer)

    }catch(err){
        console.log(err)
    }
}

init();
