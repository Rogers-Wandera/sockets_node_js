const socket = io();

const input = document.getElementById("username");
const form = document.getElementById("form");
const err = document.getElementById("errp");
const authPage = document.getElementById("auth");
const loggedin = document.getElementById("userlogged");
const chatpage = document.getElementById("chatpage");

const loginUser = (e) => {
  e.preventDefault();
  if (input.value !== "") {
    socket.emit("login", { username: input.value });
    input.value = "";
    input.focus();
  }
};

form.addEventListener("submit", loginUser);

socket.on("loggedin", (data) => {
  if (data?.username) {
    authPage.style.display = "none";
    const h3 = document.createElement("h3");
    const div = document.createElement("div");
    h3.textContent = `Logged in as ${data.username}`;
    loggedin.append(h3);
    socket.on("otherusers", (users) => {
      console.log(users);
      const ul = document.createElement("ul");
      const header = document.createElement("h4");
      header.textContent = "Select user to chat with";
      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user.username;
        li.dataset.id = user.id;
        li.addEventListener("click", (e) => {
          chatwithuser(e.target);
        });
        ul.appendChild(li);
      });
      div.append(header);
      div.append(ul);
      loggedin.append(div);
    });
    const chatwithuser = (btn) => {
      const id = btn.dataset.id;
      socket.emit("chatwithuser", { user: data.id, other: id });
      loggedin.style.display = "none";
      socket.on("partner", (data) => {
        const h3 = document.createElement("h3");
        const h2 = document.createElement("h2");
        h3.textContent = `Chatting with ${data.otherpartner.username}`;
        h2.textContent = `Hello ${data.user.username}`;
        chatpage.append(h2);
        chatpage.append(h3);
        const form = forminput(data.user);
        chatpage.append(form);
        displayMessages();
      });
    };
  }
});

socket.on("nouser", (data) => {
  err.textContent = data.msg;
  const timer = 2000;
  setTimeout(() => {
    clearTimeout(timer);
    err.innerHTML = "";
  }, timer);
});

const displayMessages = () => {
  const ul = document.createElement("ul");
  socket.on("message", (message) => {
    const li = document.createElement("li");
    li.textContent = `${message.username}: ${message.message}`;
    ul.appendChild(li);
  });
  chatpage.appendChild(ul);
};

const forminput = (user) => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  input.id = "message";
  input.placeholder = "Enter message";
  button.textContent = "send";
  button.type = "submit";
  form.append(input);
  form.append(button);

  const submitData = (e) => {
    e.preventDefault();
    const message = input.value;
    if (message.trim() !== "") {
      socket.emit("chatmessage", { username: user.username, message });
      input.value = "";
    }
  };

  form.addEventListener("submit", (e) => {
    submitData(e);
  });

  form.removeEventListener("submit", (e) => {
    submitData(e);
  });
  return form;
};
