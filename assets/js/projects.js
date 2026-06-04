// Hàm xử lý lưu thông tin dự án vào localStorage và chuyển trang
window.viewProjectDetail = function(projectStr) {
    try {
        // Giải mã chuỗi URI ngược lại thành Object dữ liệu ban đầu
        const projectData = JSON.parse(decodeURIComponent(projectStr));
        localStorage.setItem('selected_project', JSON.stringify(projectData));
        window.location.href = 'projects-detail.html';
    } catch (e) {
        console.error("Lỗi khi xử lý chuyển dữ liệu dự án:", e);
    }
}

async function startProcess() {
    try {
        const firestoreModule = await import('./firestore.mjs');
        const { addToLocalStoreRender } = firestoreModule;
        let projects = await addToLocalStoreRender('projects');
        
        if (projects && projects.length > 0) {
            const container = document.getElementById('row_con');
            if (!container) return;
            container.innerHTML = '';
            let htmlContent = '';
            
            projects.forEach((project, index) => {
                let tagsHtml = '';
                if (project.others && Array.isArray(project.others)) {
                    project.others.forEach((tag) => {
                        tagsHtml += `<span class="badge text-dark border me-1">${tag}</span>`;
                    });
                }

                // Mã hóa toàn bộ object thành chuỗi an toàn để truyền trực tiếp vào thuộc tính HTML
                const projectString = encodeURIComponent(JSON.stringify(project));

                htmlContent += `
                <div class="col-lg-6 mb-7">
                    <div class="portfolio d-flex flex-column gap-6" style="cursor: pointer;" onclick="viewProjectDetail('${projectString}')" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}" data-aos-duration="1000">
                        <div class="portfolio-img position-relative overflow-hidden">
                            <img src="${project.img || '../assets/images/backgrounds/blog-banner.jpg'}" alt="" class="img-fluid w-100">
                            <div class="portfolio-overlay">
                                <a href="javascript:void(0);" class="position-absolute top-50 start-50 translate-middle bg-primary round-64 rounded-circle hstack justify-content-center">
                                    <iconify-icon icon="lucide:arrow-up-right" class="fs-8 text-dark"></iconify-icon>
                                </a>
                            </div>
                        </div>
                        <div class="portfolio-details d-flex flex-column gap-3">
                            <h3 class="mb-0 text-dark fw-bold">${project.name || 'Tên dự án'}</h3>
                            <div class="hstack gap-2 flex-wrap">
                                ${tagsHtml}
                            </div>
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
            console.warn("Mảng projects trống, không có dữ liệu để hiển thị.");
            container.innerHTML = `<p class="text-center text-muted">Chưa có dự án nào.</p>`;
        }
    } catch (error) {
        console.error("Lỗi tiến trình startProcess:", error);
    }
}
startProcess();