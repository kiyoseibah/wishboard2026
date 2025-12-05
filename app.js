// Supabase credentials
const SUPABASE_URL = "https://qvsaqfndtkveyqqovwqz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ih6mIWYXQXjYe5wdrHJ1dA_5ApiKd7f";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Save note
document.getElementById("save-btn").addEventListener("click", async () => {
  const content = document.getElementById("content").value.trim();
  if (!content) return;

  const { error } = await client.from("notes").insert([{ content }]);
  if (error) {
    alert("Insert error: " + error.message);
    return;
  }
  document.getElementById("content").value = "";
  loadNotes();
});

// Random color helper
function getRandomColorClass() {
  const colors = ["color1","color2","color3","color4","color5","color6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Delete note
async function deleteNote(id) {
  const { error } = await client.from("notes").delete().eq("id", id);
  if (error) {
    alert("Delete error: " + error.message);
    return;
  }
  loadNotes();
}

// Make element draggable (mouse + touch)
function makeDraggable(el, board) {
  let offsetX, offsetY;

  function startDrag(ev) {
    const rect = el.getBoundingClientRect();
    if (ev.type === "mousedown") {
      offsetX = ev.offsetX;
      offsetY = ev.offsetY;
      document.addEventListener("mousemove", moveDrag);
      document.addEventListener("mouseup", endDrag);
    } else if (ev.type === "touchstart") {
      const touch = ev.touches[0];
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      document.addEventListener("touchmove", moveDrag, { passive: false });
      document.addEventListener("touchend", endDrag);
    }
    el.style.opacity = "0.7";
  }

  function moveDrag(ev) {
    ev.preventDefault(); // prevent scrolling while dragging
    if (ev.type === "mousemove") {
      el.style.left = (ev.pageX - board.offsetLeft - offsetX) + "px";
      el.style.top = (ev.pageY - board.offsetTop - offsetY) + "px";
    } else if (ev.type === "touchmove") {
      const touch = ev.touches[0];
      el.style.left = (touch.pageX - board.offsetLeft - offsetX) + "px";
      el.style.top = (touch.pageY - board.offsetTop - offsetY) + "px";
    }
  }

  function endDrag() {
    el.style.opacity = "1";
    document.removeEventListener("mousemove", moveDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", moveDrag);
    document.removeEventListener("touchend", endDrag);
  }

  el.addEventListener("mousedown", e => {
    if (e.target.classList.contains("delete-btn")) return;
    startDrag(e);
  });

  el.addEventListener("touchstart", e => {
    if (e.target.classList.contains("delete-btn")) return;
    startDrag(e);
  });
}

// Load notes
async function loadNotes() {
  const { data, error } = await client.from("notes").select("*").order("id", { ascending: false });
  const board = document.getElementById("notes-list");

  if (error) {
    console.error(error);
    board.innerHTML = "<p>Error loading notes</p>";
    return;
  }
  if (!data || data.length === 0) {
    board.innerHTML = "<p>No notes yet — be the first!</p>";
    return;
  }

  board.innerHTML = "";
  data.forEach(note => {
    const el = document.createElement("div");
    el.className = "note " + getRandomColorClass();
    el.innerHTML = `
      <button class="delete-btn">&times;</button>
      <p>${note.content}</p>
      ${note.created_at ? `<small>${new Date(note.created_at).toLocaleString()}</small>` : ""}
    `;
    el.style.left = Math.random() * (board.offsetWidth - 200) + "px";
    el.style.top = Math.random() * (board.offsetHeight - 150) + "px";

    // Delete button handler
    el.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Delete this note?")) deleteNote(note.id);
    });

    // Enable dragging
    makeDraggable(el, board);

    board.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", loadNotes);