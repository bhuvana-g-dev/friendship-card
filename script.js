let generatedURL = "";

const BASE_URL = "https://friendship-backend-tlsh.onrender.com";

let avatarOptions = [
  "asset/girl1.svg",
  "asset/girl2.svg",
  "asset/grandpa.png",
  "asset/aunt.png",
  "asset/man.png",
  "asset/uncle2.svg",
  "asset/grandma.png",
  "asset/aunty2.svg",
  "none"
];

let leftIndex = 0;
let rightIndex = 1;

/* ================= PAGE LOAD ================= */
window.onload = async function(){

  const params = new URLSearchParams(window.location.search);
  let id = params.get("id");

  // Load saved card if shared link has id
  if(id){
    try {
      const res = await fetch(`${BASE_URL}/card/${id}`);

      if(!res.ok){
        throw new Error("Invalid response");
      }

      const data = await res.json();

      document.getElementById("toName").value = data.to;
      document.getElementById("message").value = data.msg;
      document.getElementById("fromName").value = data.from;

      leftIndex = data.left;
      rightIndex = data.right;

    } catch (err){
      console.error(err);
      alert("Failed to load card ❌");
    }
  }

  // Load avatars
  updateAvatar("left");
  updateAvatar("right");

  // Left avatar click
  document.getElementById("leftAvatar").onclick = () => {
    leftIndex = (leftIndex + 1) % avatarOptions.length;
    updateAvatar("left");

    const hint = document.getElementById("avatarHint");
    if(hint) hint.classList.add("hide");
  };

  // Right avatar click
  document.getElementById("rightAvatar").onclick = () => {
    rightIndex = (rightIndex + 1) % avatarOptions.length;
    updateAvatar("right");

    const hint = document.getElementById("avatarHint");
    if(hint) hint.classList.add("hide");
  };

  // Auto hide hint after 4 seconds
  setTimeout(() => {
    const hint = document.getElementById("avatarHint");
    if(hint){
      hint.classList.add("hide");
    }
  }, 4000);

  // Animation
  setTimeout(() => {
    document.querySelectorAll(".hidden").forEach(el => {
      el.classList.add("show");
    });
  }, 1000);
};

/* ================= AVATAR ================= */
function updateAvatar(side){

  let img = document.getElementById(side + "Avatar");
  let index = (side === "left") ? leftIndex : rightIndex;
  let selected = avatarOptions[index];

  if(selected === "none"){
    img.style.display = "none";
  } else {
    img.style.display = "block";
    img.src = selected;
  }

  let leftImg = document.getElementById("leftAvatar");
  let rightImg = document.getElementById("rightAvatar");
  let heart = document.querySelector(".heart");

  heart.style.display =
    (leftImg.style.display === "none" && rightImg.style.display === "none")
    ? "none"
    : "block";
}

/* ================= GENERATE LINK ================= */
async function generateLink(){

  let to = document.getElementById("toName").value;
  let msg = document.getElementById("message").value;
  let from = document.getElementById("fromName").value;

  if(msg.trim() === ""){
    alert("Write a message first.");
    return;
  }

  try{
    let response = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to,
        msg,
        from,
        left: leftIndex,
        right: rightIndex
      })
    });

    if(!response.ok){
      throw new Error("Server error");
    }

    let data = await response.json();

    generatedURL = data.link;

    document.getElementById("link").innerHTML =
      `<a href="${generatedURL}" target="_blank">Open Card</a>`;

  } catch(err){
    console.error(err);
    alert("Backend not connected ❌");
  }
}

/* ================= GENERATE + COPY ================= */
async function generateAndCopy(){
  await generateLink();
  if(generatedURL){
    navigator.clipboard.writeText(generatedURL);
    showToast();
  }
}

/* ================= TOAST ================= */
function showToast(){
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ================= COPY ================= */
function copyLink(){
  if(!generatedURL){
    alert("Generate link first");
    return;
  }
  navigator.clipboard.writeText(generatedURL);
  showToast();
}

/* ================= WHATSAPP ================= */
 function shareWhatsApp(){
  if(!generatedURL){
    await generateLink();
  }

  if(generatedURL){
    let wa = "https://wa.me/?text=" + encodeURIComponent(generatedURL);
    window.open(wa, "_blank");
  }
}
