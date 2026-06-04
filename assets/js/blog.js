async function startProcess() {
    try {
        const firestoreModule = await import('./firestore.mjs');
        const { addToLocalStoreRender } = firestoreModule;
        let blogs = await addToLocalStoreRender('blogs');
        if (blogs && blogs.length > 0) {
            const container = document.getElementById('row_con');
            if (!container) return;
            let htmlContent = '';
            blogs.forEach((blog, index) => {
                htmlContent += `
                <div class="col-lg-6 mb-7">
                    <div class="resources d-flex flex-column gap-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}" data-aos-duration="1000">
                        <a href="blog-detail.html" class="resources-img resources-img-blog position-relative overflow-hidden d-block">
                            <img src="${blog.img || '../assets/images/backgrounds/blog-banner.jpg'}" alt="resources" class="img-fluid">
                        </a>
                        <div class="resources-details">
                            <p class="mb-0">${blog.date || 'Chưa cập nhật ngày'}</p>
                            <h4 class="mb-0">${blog.des || 'Không có tiêu đề'}</h4>
                        </div>
                    </div>
                </div>`;
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
            container.innerHTML = `<p class="text-center text-muted">Chưa có bài viết nào.</p>`;
        }
    } catch (err) {
        console.error("Lỗi tiến trình startProcess:", err);
    }
}
startProcess();