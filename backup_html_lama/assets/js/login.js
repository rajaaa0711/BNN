document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const loginForm = document.getElementById("loginForm");

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "[ Sembunyikan ]" : "[ Lihat ]";
  });

  // Auto-fill jika sebelumnya pernah login
  try {
    const savedUser = localStorage.getItem("simRehabUser");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const usernameInput = document.getElementById("username");
      const roleSelect = document.getElementById("role");
      if (usernameInput && parsed.username) usernameInput.value = parsed.username;
      if (roleSelect && parsed.role) roleSelect.value = parsed.role;
    }
  } catch (e) {}

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value;
    const role = document.getElementById("role").value;

    if (!username || !password) {
      alert("Mohon lengkapi NIP/Username dan Kata Sandi.");
      return;
    }

    const userData = JSON.stringify({ username, role });

    // Simpan sesi user ke localStorage (permanen) & sessionStorage
    localStorage.setItem("simRehabUser", userData);
    sessionStorage.setItem("simRehabUser", userData);

    window.location.href = "dashboard.html";
  });
});
