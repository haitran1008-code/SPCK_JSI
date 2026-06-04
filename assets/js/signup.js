import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import  firebaseConfig  from './firebase-config.mjs';
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en'
const googleprovider = new GoogleAuthProvider();
const githubprovider = new GithubAuthProvider();
const googleLogin = document.getElementById('gg_btn');
const githubLogin = document.getElementById('gh_btn');

googleLogin.addEventListener("click",function(){
    signInWithPopup(auth, googleprovider)
    .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    window.location.href = '../html/index.html'
    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    });
});
githubLogin.addEventListener("click",function(){
    signInWithPopup(auth, githubprovider)
    .then((result) => {
    const credential = GithubAuthProvider.credentialFromResult(result);
    const user = result.user;
    window.location.href = '../html/index.html'
    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    });
});

const registerForm = document.getElementById('register-form');
const inpEmail = document.getElementById('exampleInputEmail1');
const inpPwd = document.getElementById('inputPassword');
const inpName = document.getElementById('disabledTextInput');

function handleRegister(event) {
    event.preventDefault();

    let email = inpEmail.value;
    let password = inpPwd.value;
    let name = inpName.value;
    let role_id = 2;

    if (!email || !password || !name) {
        alert("Vui lòng điền đủ các trường");
        return;
    }
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            let userData = {
                uid: user.uid,
                name: name,
                email: email,
                password: password,
                role_id: role_id,
            };

            setDoc(doc(db, "users", user.uid), userData)
                .then(() => {
                    alert("Đăng ký thành công");
                    window.location.href = '../html/index.html';
                })
                .catch((error) => {
                    alert("Lỗi khi lưu dữ liệu người dùng");
                    console.error("Error adding document: ", error);
                });
        })
        .catch((error) => {
            alert(`Lỗi đăng ký: ${error.message}`);
        });
    }

registerForm.addEventListener("submit", handleRegister)

