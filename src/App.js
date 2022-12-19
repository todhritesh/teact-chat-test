import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { io } from "socket.io-client"

function App() {
  const [socket, setSocket] = useState()
  const [messages, setMessages] = useState([])
  const [conversation, setConversation] = useState()
  const base_url = "http://localhost:8080/api"
  const [userData , setUserData] = useState()
  const [text , setText]  = useState("")
  const [typing , setTyping] = useState(false)
  const [typingTimeout, settypingTimeout] = useState(null);

  useEffect(() => {
    setSocket(io("http://localhost:8080"))
    getConversation()
  }, [])

  async function getConversation() {
    const { data } = await axios.post(base_url + "/admin-student-conversations/single-conversation", {
      studentId: "639b4e649ce109347a7a2951"
    })
    setConversation(data)
  }
  async function getMessages() {
    const { data } = await axios.get(base_url + `/admin-student-message/get-messages?conversationId=${conversation._id}&page=${1}&limit=${10}`)
    setMessages(data)
  }
  useEffect(() => {
    if (conversation)
      getMessages()
  }, [conversation])

  async function sendMessage(e) {
    e.preventDefault()
    if(!text) alert("Message cant be empty !!")
    let msg = text;
    setText("")
    const {data} = await axios.post(base_url+"/admin-student-message/send-message",{
      "messageType":"Text",
      "senderId":userData.userId,
      "conversationId":"63a01ce1d33201ca86e0b377",
      "content":{
        "textContent":msg
      }
    })
    setMessages(prev=>([...prev , data]))
    socket.emit("send-message",data)
  }

  useEffect(()=>{
    if(!socket){
      console.log("skt not")
    } else{
      socket.on("recieve-message",(data)=>{
        console.log(data)
        setMessages((prev)=>([...prev,data]))
      })
      socket.on("typing-started-from-server", () => {
        console.log("typing started")
        setTyping(true)
      });
      socket.on("typing-stopped-from-server", () => {
        console.log("typing stopped")
        setTyping(false)
      });
    }
  },[socket])


  function handleInput(e) {
    setText(e.target.value);

    socket.emit("typing-started");

    if (typingTimeout) clearTimeout(typingTimeout);

    settypingTimeout(
      setTimeout(() => {
        socket.emit("typing-stopped");
      }, 1000)
    );
  }



  if(userData===undefined){
    return (
      <>
        <button onClick={()=>setUserData({
          userId:"639b4e649ce109347a7a2951",
          userType:"Student"
        })} >Student</button>

        <button onClick={()=>setUserData({
          userId:"637ba9da57ed4a2914cbdfab",
          userType:"Admin"
        })} >Admin</button>
      </>
    )
  }


  return (
    <section style={{ backgroundColor: "#eee", height: "100vh" }}>
      <div className="container py-5">

        <div className="row d-flex justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-6">

            <div className="card" id="chat2">
              <div className="card-header d-flex justify-content-between align-items-center p-3">
                <h5 className="mb-0">{userData.userType}</h5>
              </div>
              <div className="card-body" data-mdb-perfect-scrollbar="true" style={{ position: "relative", height: "400px", overflow: "auto" }}>
    
                {
                  messages.map((item , i) => {

                    if (item.messageType === "Text") {
                      if (userData.userId === item.sender) {
                        return (
                          <div key={i} className="d-flex flex-row justify-content-end">
                            <div>
                              <p className="small p-2 ms-3 mb-1 rounded-3" style={{ backgroundColor: "rgb(201 228 255)" }}>
                                {item.textContent}
                              </p>
                              <p className="small ms-3 mb-3 rounded-3 text-muted">23:58</p>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div  key={i} className="d-flex flex-row justify-content-start">
                            <div>
                              <p className="small p-2 ms-3 mb-1 rounded-3" style={{ backgroundColor: "rgb(172 255 188)" }}>
                                {item.textContent}
                              </p>
                              <p className="small ms-3 mb-3 rounded-3 text-muted">23:58</p>
                            </div>
                          </div>
                        )
                      }
                    } else {
                      return null
                    }
                  })
                }





              </div>
                <h6 className='ps-4' >
                  {
                    typing && "Typing ..."
                  }
                </h6>
              <div className="card-footer">

                <form method='post' onSubmit={sendMessage} >
                  <input value={text} onChange={handleInput} type="text" className="form-control form-control-lg w-100" id="exampleFormControlInput1"
                    placeholder="Type message" />
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default App