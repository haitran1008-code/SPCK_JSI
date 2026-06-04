async function startProcess() {
    try {
        const cachedBlogs = localStorage.getItem('blogs');
        let blogs = null;
        if (cachedBlogs) {
            blogs = JSON.parse(cachedBlogs);
        } else {
            console.log("Đang tải dữ liệu gốc từ Firebase...");
            const firestoreModule = await import('./firestore.mjs');
            const { fetchDocuments } = firestoreModule;
            blogs = await fetchDocuments("blogs");
            console.log("Dữ liệu từ Firebase:", blogs);
            if (blogs && blogs.length > 0) {
                localStorage.setItem('blogs', JSON.stringify(blogs)); // PHẢI dùng JSON.stringify
            }
        }
        if (blogs && blogs.length > 0) {
            const container = document.getElementById('row_con');
            if (!container) return;
            container.innerHTML = '';
            let htmlContent = '';
            blogs.forEach((blog, index) => {
                if (index < 3) {
                    const blogImg = blog.img || '../assets/images/backgrounds/blog-banner.jpg';
                    const blogDate = blog.date || 'Chưa cập nhật ngày';
                    const blogDes = blog.des || 'Không có tiêu đề';
                    if (index === 0) {
                        htmlContent += `
                        <div class="col-xl-6 mb-7 mb-xl-0">
                            <div class="resources d-flex flex-column gap-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}" data-aos-duration="1000">
                                <a href="blog-detail.html" class="resources-img resources-img-first position-relative overflow-hidden d-block">
                                    <img src="${blogImg}" alt="resources" class="img-fluid">
                                </a>
                                <div class="resources-details">
                                    <p class="mb-0">${blogDate}</p>
                                    <h4 class="mb-0">${blogDes}</h4>
                                </div>
                            </div>
                        </div>`;
                    } else {
                        htmlContent += `
                        <div class="col-md-6 col-xl-3 mb-7 mb-xl-0">
                            <div class="resources d-flex flex-column gap-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}" data-aos-duration="1000">
                                <a href="blog-detail.html" class="resources-img position-relative overflow-hidden d-block">
                                    <img src="${blogImg}" alt="resources" class="img-fluid">
                                </a>
                                <div class="resources-details">
                                    <p class="mb-0">${blogDate}</p>
                                    <h4 class="mb-0">${blogDes}</h4>
                                </div>
                            </div>
                        </div>`;
                    }
                }
            });
            container.innerHTML = htmlContent;
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 1000,
                        once: true
                    });
                }
            }, 300);
        } else {
            console.warn("Mảng blogs trống, không có dữ liệu để hiển thị.");
            const container = document.getElementById('row_con');
            if (container) {
                container.innerHTML = `<p class="text-center text-muted w-100 py-5">Chưa có bài viết nào.</p>`;
            }
        }
    } catch (error) {
        console.error("Lỗi tiến trình xử lý blogs:", error);
        // Nếu lỡ dữ liệu trong máy bị lỗi cấu trúc JSON, xóa đi để nạp lại mới ở lần sau
        localStorage.removeItem('blogs');
    }
}
startProcess();