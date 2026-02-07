
window.PristineChat = {
  init: function(config) {
    const box = document.createElement("div");
    box.style.position="fixed";
    box.style.bottom="20px";
    box.style.right="20px";
    box.style.width=config.width+"px";
    box.style.background="#fff";
    box.style.border="1px solid #ccc";
    box.style.padding="10px";
    box.innerHTML = `
      <div style="font-weight:bold">${config.headerTitle}</div>
      <div id="chatBox" style="height:250px;overflow:auto;border:1px solid #eee;margin:10px 0;padding:5px"></div>
      <input id="msg" placeholder="Type..." style="width:70%">
      <button onclick="sendMsg()">Send</button>
    `;
    document.body.appendChild(box);

    const session = localStorage.getItem("chat_session") || crypto.randomUUID();
    localStorage.setItem("chat_session", session);

    async function sendMsg(){
        const msg = document.getElementById("msg").value;
        document.getElementById("msg").value="";
        append("You: "+msg);

        const res = await fetch(config.apiBaseUrl+"/chat",{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({session_id:session,message:msg})
        });
        const data = await res.json();
        append("AI: "+data.reply);
    }

    function append(t){
        const c = document.getElementById("chatBox");
        c.innerHTML += "<div>"+t+"</div>";
        c.scrollTop = c.scrollHeight;
    }
  }
};
