import firebaseConfig from './firebase-config.mjs';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // hoặc dùng biến db đã khởi tạo của bạn
export async function addDocToCollection(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef;
    } catch (error) {
        console.error("Error inside addDocToCollection helper:", error);
        throw error;
    }
}

window.selectPaymentMethod = function(element, method) {
    document.querySelectorAll('.payment-method-box').forEach(box => {
        box.classList.remove('active');
        box.querySelector('input[type="radio"]').checked = false;
    });
    
    element.classList.add('active');
    element.querySelector('input[type="radio"]').checked = true;
};
function initCheckoutPage() {
    try {
        const storedPackage = localStorage.getItem('selected_package');
        const defaultPackage = { name: 'Launch', original: 699, sale: 699 };
        const packageData = storedPackage ? JSON.parse(storedPackage) : defaultPackage;
        
        document.getElementById('packageName').innerText = `${packageData.name} Plan`;
        document.getElementById('packageTag').innerText = packageData.name;
        
        if (packageData.original > packageData.sale) {
            document.getElementById('originalPrice').innerText = `$${packageData.original.toLocaleString()}`;
            document.getElementById('originalPrice').parentElement.classList.remove('d-none');
        } else {
            document.getElementById('originalPrice').parentElement.classList.add('d-none');
        }
        
        document.getElementById('discountedPrice').innerText = `$${packageData.sale.toLocaleString()}`;
        document.getElementById('totalPrice').innerText = `$${packageData.sale.toLocaleString()}`;
        
    } catch (error) {
        console.error("Error loading checkout details:", error);
    }
}
window.handlePaymentSubmit = async function(event) {
    event.preventDefault(); 
    const qrArea = document.getElementById('qrArea');
    const qrImage = document.getElementById('qrImage');
    const paymentContent = document.getElementById('paymentContent');
    const submitButton = event.target.querySelector('button[type="submit"]');
    if(submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = "Processing...";
    }
    const fullName = event.target.querySelector('input[placeholder="John Doe"]').value;
    const email = event.target.querySelector('input[placeholder="name@company.com"]').value;
    const phone = event.target.querySelector('input[placeholder*="555"]').value;
    const notes = event.target.querySelector('textarea').value;
    const packageName = document.getElementById('packageTag').innerText;
    const totalAmount = document.getElementById('totalPrice').innerText;
    const orderId = 'STDV' + Math.floor(10000 + Math.random() * 90000);
    const orderData = {
        orderId: orderId,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        projectNotes: notes,
        planSelected: packageName,
        amountDue: totalAmount,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };

    try {

        await addDocToCollection('orders',orderData);
        paymentContent.innerText = orderId;
        const priceNum = parseFloat(totalAmount.replace('$', '').replace(/,/g, ''));
        const priceInVnd = Math.round(priceNum * 25000);
        const BANK_ID = 'ICB'; 
        const ACCOUNT_NO = '102873111111'; 
        const ACCOUNT_NAME = 'CONG TY STUDIOVA'; 
        const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${priceInVnd}&addInfo=${orderId}&accountName=${ACCOUNT_NAME}`;
        qrImage.src = qrUrl;
        qrArea.classList.remove('d-none');
        qrArea.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Lỗi khi lưu đơn hàng lên Firebase:", error);
        alert("An error occurred while processing your order. Please try again.");
    } finally {
        // Trả lại trạng thái nút bấm ban đầu
        if(submitButton) {
            submitButton.disabled = false;
            submitButton.innerText = "Complete Checkout";
        }
    }
};
window.confirmPaymentPaid = function() {
    alert("Thank you for your payment! We have received your subscription request. Our team will verify and contact you via email within 15-30 minutes.");
    localStorage.removeItem('selected_package');
    window.location.href = '../index.html'; 
};

document.addEventListener('DOMContentLoaded', initCheckoutPage);