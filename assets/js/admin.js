import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import firebaseConfig from './firebase-config.mjs'; 

// Chặn bảo mật tầng đầu
if (localStorage.getItem('isAdminConfirmed') !== 'true') {
    alert("Unauthorized Access! Redirecting to homepage...");
    window.location.href = '../index.html';
} else {
    initAdminDashboard();
}

async function initAdminDashboard() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // =========================================================================
        // [CHỨC NĂNG 1]: QUẢN LÝ ĐƠN HÀNG (ORDERS) - CACHE & REALTIME
        // =========================================================================
        function listenToOrders() {
            const tableBody = document.getElementById('ordersTableBody');
            if (!tableBody) return;

            const cachedOrders = localStorage.getItem('cached_orders');
            if (cachedOrders) {
                renderOrdersUI(JSON.parse(cachedOrders), tableBody);
            }

            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            
            onSnapshot(q, (querySnapshot) => {
                const ordersList = [];
                querySnapshot.forEach((documentSnapshot) => {
                    ordersList.push({
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    });
                });

                localStorage.setItem('cached_orders', JSON.stringify(ordersList));
                renderOrdersUI(ordersList, tableBody);
            });
        }

        function renderOrdersUI(orders, tableBody) {
            if (orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No orders found.</td></tr>`;
                return;
            }

            let htmlContent = '';
            orders.forEach((order) => {
                htmlContent += `
                    <tr>
                        <td class="font-monospace fw-bold text-danger">${order.orderId || 'N/A'}</td>
                        <td><div class="fw-bold">${order.customerName}</div></td>
                        <td><small class="text-muted">${order.customerEmail}<br>${order.customerPhone}</small></td>
                        <td><span class="badge bg-dark">${order.planSelected} Plan</span></td>
                        <td class="fw-bold text-success">${order.amountDue}</td>
                        <td>
                            <select class="form-select form-select-sm change-order-status" data-id="${order.id}">
                                <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                                <option value="cancelled" ${order.paymentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td><small class="text-muted">${order.createdAt ? order.createdAt.substring(0, 10) : ''}</small></td>
                    </tr>
                `;
            });
            tableBody.innerHTML = htmlContent;

            document.querySelectorAll('.change-order-status').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const orderId = e.target.getAttribute('data-id');
                    const newStatus = e.target.value;
                    try {
                        await updateDoc(doc(db, 'orders', orderId), { paymentStatus: newStatus });
                    } catch (err) {
                        alert("Failed to update status: " + err.message);
                    }
                });
            });
        }

        // =========================================================================
        // [CHỨC NĂNG 2]: QUẢN LÝ DỰ ÁN (PROJECTS) - CACHE & REALTIME
        // =========================================================================
        function listenToProjects() {
            const tableBody = document.getElementById('projectsTableBody');
            if (!tableBody) return;

            const cachedProjects = localStorage.getItem('cached_projects');
            if (cachedProjects) {
                renderProjectsUI(JSON.parse(cachedProjects), tableBody);
            }

            onSnapshot(collection(db, 'projects'), (querySnapshot) => {
                const projectsList = [];
                querySnapshot.forEach((documentSnapshot) => {
                    projectsList.push({
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    });
                });

                localStorage.setItem('cached_projects', JSON.stringify(projectsList));
                renderProjectsUI(projectsList, tableBody);
            });
        }

        function renderProjectsUI(projects, tableBody) {
            if (projects.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No projects found.</td></tr>`;
                return;
            }

            let htmlContent = '';
            projects.forEach((p) => {
                let tagsBadges = '';
                if (p.others && Array.isArray(p.others)) {
                    p.others.forEach(tag => {
                        tagsBadges += `<span class="badge border text-dark me-1">${tag}</span>`;
                    });
                }

                htmlContent += `
                    <tr>
                        <td><img src="${p.img || '../assets/images/backgrounds/blog-banner.jpg'}" class="rounded" style="width: 60px; height: 40px; object-fit: cover;"></td>
                        <td class="fw-bold">${p.name || 'Project Name'}</td>
                        <td>${tagsBadges}</td>
                        <td class="text-end">
                            <button data-id="${p.id}" class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-project-btn">Delete</button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = htmlContent;

            document.querySelectorAll('.delete-project-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteItem('projects', e.target.getAttribute('data-id')));
            });
        }

        // =========================================================================
        // [CHỨC NĂNG 3]: QUẢN LÝ TIN TỨC (BLOGS) - ĐÃ ĐỔI TITLE -> DES & THÊM DATE
        // =========================================================================
        function listenToBlogs() {
            const tableBody = document.getElementById('blogsTableBody');
            if (!tableBody) return;

            const cachedBlogs = localStorage.getItem('cached_blogs');
            if (cachedBlogs) {
                renderBlogsUI(JSON.parse(cachedBlogs), tableBody);
            }

            // Sắp xếp các bài Blog theo trường date mới nhập
            onSnapshot(collection(db, 'blogs'), (querySnapshot) => {
                const blogsList = [];
                querySnapshot.forEach((documentSnapshot) => {
                    blogsList.push({
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    });
                });

                localStorage.setItem('cached_blogs', JSON.stringify(blogsList));
                renderBlogsUI(blogsList, tableBody);
            });
        }

        function renderBlogsUI(blogs, tableBody) {
            if (blogs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No blogs found.</td></tr>`;
                return;
            }

            let htmlContent = '';
            blogs.forEach((b) => {
                htmlContent += `
                    <tr>
                        <td><img src="${b.img || '../assets/images/backgrounds/blog-banner.jpg'}" class="rounded" style="width: 60px; height: 40px; object-fit: cover;"></td>
                        <td class="fw-bold text-wrap" style="max-width: 300px;">${b.des || 'No description'}</td>
                        <td>${b.author || 'Admin'}</td>
                        <td><span class="badge bg-light text-dark border">${b.date || 'N/A'}</span></td>
                        <td class="text-end">
                            <button data-id="${b.id}" class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-blog-btn">Delete</button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = htmlContent;

            document.querySelectorAll('.delete-blog-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteItem('blogs', e.target.getAttribute('data-id')));
            });
        }

        // =========================================================================
        // [HÀM XÓA CHUNG VÀ CÁC THAO TÁC BIỂU MẪU]
        // =========================================================================
        async function deleteItem(collectionName, id) {
            if (confirm(`Are you sure you want to delete this item?`)) {
                try {
                    await deleteDoc(doc(db, collectionName, id));
                } catch (error) {
                    console.error("Error deleting document:", error);
                }
            }
        }

        window.submitProjectForm = async function(event) {
            event.preventDefault();
            const name = document.getElementById('p_name').value;
            const img = document.getElementById('p_img').value;
            const tagsInput = document.getElementById('p_tags').value;
            const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const newProject = {
                name: name,
                img: img || '../assets/images/backgrounds/blog-banner.jpg',
                others: tagsArray,
                createdAt: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, 'projects'), newProject);
                closeBootstrapModal('addProjectModal', 'projectForm');
            } catch (error) {
                alert("Error adding project: " + error.message);
            }
        };

        // SUBMIT FORM BLOG: Đã cập nhật thu thập trường 'des' và 'date'
        window.submitBlogForm = async function(event) {
            event.preventDefault();
            const des = document.getElementById('b_des').value;   // Thay đổi lấy giá trị b_des
            const date = document.getElementById('b_date').value; // Lấy giá trị ngày tháng b_date
            const author = document.getElementById('b_author').value;
            const img = document.getElementById('b_img').value;

            const newBlog = {
                des: des,        // Lưu cấu trúc trường 'des' lên Firestore thay cho title
                date: date,      // Lưu cấu trúc trường 'date' tự chọn lên Firestore
                author: author,
                img: img || '../assets/images/backgrounds/blog-banner.jpg',
                createdAt: new Date().toISOString() // Dùng làm mốc phân loại phụ ngầm
            };

            try {
                await addDoc(collection(db, 'blogs'), newBlog);
                closeBootstrapModal('addBlogModal', 'blogForm');
            } catch (error) {
                alert("Error creating blog post: " + error.message);
            }
        };

        function closeBootstrapModal(modalId, formId) {
            const modalEl = document.getElementById(modalId);
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            const formEl = document.getElementById(formId);
            if (formEl) formEl.reset();
        }

        // KHỞI ĐỘNG ĐỒNG LOẠT
        listenToOrders();
        listenToProjects();
        listenToBlogs();

    } catch (e) {
        console.error("Firebase Error: ", e);
    }
}