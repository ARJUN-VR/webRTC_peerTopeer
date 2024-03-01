let localStream;
let remoteStream;
let peerConnection;

let APP_ID = 'ee72756447384b99bc153873ce4451c7';
let token = null;
let uid = String(Math.floor(Math.random()*10000))

let client;
let channel;

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}


const init = async () => {
  try {

    client = AgoraRTM.createInstance(APP_ID)
    await client.login({uid,token})

    channel = await client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined',handleJoined)

    client.on('MessageFromPeer',handleMessageFromPeer)



    localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const user1 = document.getElementById("user1");

    user1.srcObject = localStream;

  } catch (error) {
    console.log(error);
  }
};

const handleJoined = async(MemberId)=>{
  createOffer(MemberId)
  console.log('a new user joined:',MemberId)
}

const handleMessageFromPeer = async(message,MemberId)=>{
  message = JSON.parse(message.text);
  console.log('message:',message)
  if(message.type ==='offer'){
    createAnswer(MemberId,message.offer)
    console.log('offer works')
  }else if(message.type==='answer'){
    addAnswer(message.answer)
    console.log('answer works')

  }else if(message.type === 'candidate'){
    console.log('entering')
    if(peerConnection){
      console.log('1 works')
      peerConnection.addIceCandidate(message.candidate)
      console.log('2 works')
    }
  }
}

let createPeerConnection = async(MemberId)=>{
  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream()
  document.getElementById('user2').srcObject = remoteStream
  

  localStream.getTracks().forEach((track)=>{
    peerConnection.addTrack(track,localStream)
  })

  peerConnection.ontrack = (event)=>{
    event.streams[0].getTracks().forEach((track)=>{
      remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async(event) =>{
    if(event.candidate){
      client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberId)
    }
  }

}

let createOffer = async(MemberId)=>{
    try{

      await createPeerConnection(MemberId)
       
        let offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId)

    }catch(err){
        console.log(err)
    }
}


const createAnswer = async (MemberId, offer) => {
  try {

   await createPeerConnection(MemberId)

    

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId);
  } catch (err) {
    console.log(err);
  }
};

const addAnswer = async(answer)=>{
  if(!peerConnection.currentRemoteDescription){
    peerConnection.setRemoteDescription(answer)
  }
}


init();
