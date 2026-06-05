import firebaseConfig from './firebase-config.mjs';

// Hàm 1: Thêm tài liệu (Dành cho Node.js chạy qua file menu.js)
async function addObjectToFirestore(object, collectionName) {
    if (object) {
        try {
            // Import động thư viện firebase npm cài từ terminal để né lỗi CDN
            const { initializeApp } = await import("firebase/app");
            const { getFirestore, collection, addDoc } = await import("firebase/firestore");

            // Khởi tạo Firebase trực tiếp trong môi trường Node.js
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const colRef = collection(db, collectionName);

            // Sửa lỗi biến 'img' thành biến 'object' theo đúng tham số nhận vào
            const docRef = await addDoc(colRef, object);
            console.log("Thêm vào Firestore thành công! ID tài liệu:", docRef.id);
            return docRef.id;
            
        } catch (error) {
            console.error("Lỗi khi xử lý với Firebase:", error);
            return null;
        }
    }
}

// Hàm 2: Lấy toàn bộ tài liệu (Dành cho Trình duyệt web chạy qua file blog.js/project.js)
const fetchDocuments = async (collectionName) => {
    try {
        // SỬA: Chuyển hẳn import CDN vào ĐÂY để Node.js không quét trúng khi chạy menu.js
        const { getDocs,collection,getFirestore } = await import("https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js");
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js")
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() }); 
        });
        return data;
    } catch (error) {
        console.error("Error fetching documents: ", error);
        return [];
    }
};

async function findImage(collection,name) {
    const foundLogo = collection.find(logo => logo.name == name);
    if (foundLogo) {
        return foundLogo.img_link;
    }
}

async function addToLocalStore(collectionName) {
    const cachedCollection = localStorage.getItem(collectionName);
    let collection = null;
    if (cachedCollection) {
        collection = JSON.parse(cachedCollection);
        return collection
    } else {
        console.log("Đang tải dữ liệu gốc từ Firebase...");
        const firestoreModule = await import('./firestore.mjs');
        const { fetchDocuments } = firestoreModule;
        collection = await fetchDocuments(collectionName);
        if (collection && collection.length > 0) {
            localStorage.setItem(collectionName, JSON.stringify(collection));
            return collection
        }
    }
}

async function addToLocalStoreRender(collectionName) {
    const cachedCollection = localStorage.getItem(collectionName);
    const cachedCollection_2 = localStorage.getItem(`cached_${collectionName}`);
    let collection = null;
    if (cachedCollection_2){
        if (cachedCollection && cachedCollection.length == cachedCollection_2.length) {
            collection = JSON.parse(cachedCollection);
            return collection
        }
    }
    else {
        if (cachedCollection) {
            collection = JSON.parse(cachedCollection);
            return collection
        }
        else {
            const firestoreModule = await import('./firestore.mjs');
            const { fetchDocuments } = firestoreModule;
            collection = await fetchDocuments(collectionName);
            if (collection && collection.length > 0) {
                localStorage.setItem(collectionName, JSON.stringify(collection));
                return collection
            }
        }   
    }
}

export { addObjectToFirestore, fetchDocuments, findImage, addToLocalStore, addToLocalStoreRender };