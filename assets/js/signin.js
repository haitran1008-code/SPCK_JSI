import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import firebaseConfig from './firebase-config.mjs';
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';

const googleprovider = new GoogleAuthProvider();
const githubprovider = new GithubAuthProvider();
const googleLogin = document.getElementById('gg_btn');
const githubLogin = document.getElementById('gh_btn');

// --- ĐỊNH NGHĨA EMAIL ADMIN TỐI CAO CỦA HỆ THỐNG ---
const ADMIN_EMAIL = "admin@studiova.com"; // <-- Hãy thay đổi đúng Email Admin của bạn tại đây

// --- KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (Tự động chuyển hướng nếu phiên còn hạn) ---
const cachedSession = localStorage.getItem('user_session');
if (cachedSession) {
    try {
        const userSession = JSON.parse(cachedSession);
        const now = new Date().getTime();
        if (now < userSession?.expiry) {
            // SỬA: Nếu phiên là của Admin thì đưa thẳng vào trang quản trị, ngược lại mới ra trang chủ
            if (userSession.email === ADMIN_EMAIL) {
                localStorage.setItem('isAdminConfirmed', 'true');
                window.location.href = 'admin.html';
            } else {
                window.location.href = '../html/index.html';
            }
        }
    } catch (e) {
        localStorage.removeItem('user_session');
        localStorage.removeItem('isAdminConfirmed');
    }
}

// --- HÀM TIỆN ÍCH: XỬ LÝ LƯU PHIÊN VÀ PHÂN LUỒNG DI CHUYỂN TRANG ---
function processUserLoginSuccess(user) {
    // Tách phần trước dấu @ của email để làm tên hiển thị tạm thời nếu thiếu displayName
    const systemUsername = user.displayName || user.email.split('@')[0];
    
    // Cấu hình dữ liệu phiên (Bổ sung thêm trường email để lọc quyền ở vòng check ban đầu)
    const userSession = {
        username: systemUsername,
        email: user.email,
        expiry: new Date().getTime() + 2 * 60 * 60 * 1000 // Hạn 2 tiếng
    };
    localStorage.setItem('user_session', JSON.stringify(userSession));

    // KIỂM TRA PHÂN QUYỀN VÀ ĐIỀU HƯỚNG TRANG
    if (user.email === ADMIN_EMAIL) {
        localStorage.setItem('isAdminConfirmed', 'true'); // Cấp quyền mở nút Admin ở trang chủ
        alert("Welcome back, Master Admin! Redirecting to Dashboard...");
        window.location.href = 'admin.html'; // Đi thẳng vào admin.html
    } else {
        localStorage.removeItem('isAdminConfirmed'); // Xóa cờ nếu tài khoản thường đăng nhập đè lên
        alert("Sign In Successful!");
        window.location.href = '../html/index.html'; // Đi ra index.html của khách
    }
}

// --- ĐĂNG NHẬP BẰNG GOOGLE ---
googleLogin.addEventListener("click", function () {
    signInWithPopup(auth, googleprovider)
        .then((result) => {
            // Gọi hàm xử lý phân quyền dùng chung
            processUserLoginSuccess(result.user);
        }).catch((error) => {
            console.error(error.message);
            alert("Google Authentication failed.");
        });
});

// --- ĐĂNG NHẬP BẰNG GITHUB ---
githubLogin.addEventListener("click", function () {
    signInWithPopup(auth, githubprovider)
        .then((result) => {
            // Gọi hàm xử lý phân quyền dùng chung
            processUserLoginSuccess(result.user);
        }).catch((error) => {
            console.error(error.message);
            alert("GitHub Authentication failed.");
        });
});

// --- ĐĂNG NHẬP BẰNG EMAIL & PASSWORD ---
const inpEmail = document.getElementById("exampleInputEmail1");
const inpPwd = document.getElementById("inputPassword");
const loginForm = document.getElementById("login_form_si");

function handleLogin(event) {
    event.preventDefault();

    let email = inpEmail.value.trim();
    let password = inpPwd.value;

    if (!email || !password) {
        alert("Vui lòng điền đủ các trường");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Gọi hàm xử lý phân quyền dùng chung
            processUserLoginSuccess(userCredential.user);
        })
        .catch((error) => {
            console.error("Login Error:", error.code);
            alert("Tài khoản hoặc mật khẩu không đúng");
        });
}

loginForm.addEventListener("submit", handleLogin);