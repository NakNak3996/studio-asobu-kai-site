function setActiveSection(section) {
  // タブのハイライト
  document.querySelectorAll(".tab").forEach(a => {
    a.classList.toggle("is-active", a.dataset.section === section);
  });

  // セクション表示切替
  document.querySelectorAll("section[data-section]").forEach(s => {
    s.style.display = (s.dataset.section === section) ? "block" : "none";
  });

  // 最後に開いたタブを保存（スマホで便利）
  try { localStorage.setItem("last_section", section); } catch {}
}

function getInitialSection() {
  const hash = (location.hash || "").replace("#", "");
  if (hash) return hash;
  try {
    return localStorage.getItem("last_section") || "home";
  } catch {
    return "home";
  }
}

async function loadSchedule() {
  const list = document.getElementById("scheduleList");
  const statusBox = document.getElementById("statusBox");

  // status（任意）
  try {
    const statusRes = await fetch("data/status.json", { cache: "no-store" });
    if (statusRes.ok) {
      const st = await statusRes.json();
      if (st && st.text) statusBox.textContent = `現在ステータス：${st.text}`;
    }
  } catch {}

  // schedule
  try {
    const res = await fetch("data/schedule.json", { cache: "no-store" });
    if (!res.ok) throw new Error("schedule.json not found");
    const data = await res.json();

    list.innerHTML = "";
    (data.items || []).forEach(item => {
      const div = document.createElement("div");
      div.className = "schedule-item";

      const date = document.createElement("div");
      date.className = "schedule-date";
      date.textContent = `${item.date} ${item.time || ""} ${item.place ? " @ " + item.place : ""}`.trim();

      const title = document.createElement("div");
      title.textContent = item.title || "";

      div.appendChild(date);
      if (item.status) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = item.status;
        date.appendChild(badge);
      }
      div.appendChild(title);

      if (item.note) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = item.note;
        div.appendChild(note);
      }

      list.appendChild(div);
    });

    if (!data.items || data.items.length === 0) {
      list.innerHTML = '<p class="note">スケジュールは未登録です。</p>';
    }
  } catch (e) {
    list.innerHTML = '<p class="note">スケジュールの読み込みに失敗しました（data/schedule.json を確認してください）。</p>';
  }
}

function wireTabs() {
  // hash変更でタブ切替
  window.addEventListener("hashchange", () => {
    const section = getInitialSection();
    setActiveSection(section);
  });

  // 初期表示
  const section = getInitialSection();
  setActiveSection(section);
}

(async () => {
  wireTabs();
  await loadSchedule();
})();
