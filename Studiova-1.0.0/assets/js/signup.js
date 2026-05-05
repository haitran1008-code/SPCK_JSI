import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import  firebaseConfig  from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
