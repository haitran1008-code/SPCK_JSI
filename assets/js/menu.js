async function startUpload() {
    try {
        const firestoreModule = await import('./firestore.mjs');
        const { addToLocalStore,findImage,fetchDocuments } = firestoreModule;
        let svgs = await addToLocalStore('svgs');
        let logos = await addToLocalStore('logos');
        if (svgs && logos) {
            const sec_leaf_link = await findImage(svgs, 'secondary-leaf');
            const logo_white_link = await findImage(logos, 'logo-white');
            const logo_black_link = await findImage(logos, 'logo-dark');
            const pri_leaf_link = await findImage(svgs, 'primary-leaf');
            if (sec_leaf_link) {
                document.querySelectorAll('.img-fluid.animate-spin').forEach(element => {
                    element.src = sec_leaf_link;
                });
            }
            if (logo_white_link) {
                const elWhite = document.getElementById('logo_white');
                if (elWhite) elWhite.src = logo_white_link;
            }
            if (logo_black_link) {
                const elBlack = document.getElementById('logo_black');
                if (elBlack) elBlack.src = logo_black_link;
                const elBlack_2 = document.getElementById('logo_black_2');
                if (elBlack_2) elBlack_2.src = logo_black_link;
            }
            if (pri_leaf_link) {
                const elPri = document.getElementById('pri_leaf');
                if (elPri) elPri.src = pri_leaf_link;
            }
        }
    } catch (error) {
        console.error("Lỗi khi gọi hàm bổ sung dữ liệu:", error);
    }
    const cachedSession = localStorage.getItem('user_session');
    if (cachedSession) {
        try {
            const userSession = JSON.parse(cachedSession);
            const now = new Date().getTime();
            const authGuest = document.getElementById('auth_guest'); // Cụm chứa 2 nút Sign In / Sign Up
            const authUser = document.getElementById('auth_user');   // Thẻ <a> hiển thị tên
            if (userSession && now < userSession.expiry) {
                if (authGuest) {
                    authGuest.classList.add('d-none'); 
                }
                if (authUser) {
                    authUser.innerHTML = `Xin chào, <span class="text-primary">${userSession.username}</span>`;
                }
            } else {
                localStorage.removeItem('user_session');
                if (authGuest) authGuest.classList.remove('d-none');
                if (authUser) authUser.textContent = '';
            }
        } catch (error) {
            console.error("Lỗi đọc session:", error);
        }
    }
}
startUpload();