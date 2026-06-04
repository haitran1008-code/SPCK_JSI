const path = require('path');
const fs = require('fs');
const cloudinary = require('./utils/cloudinary');
async function uploadLocalImage(img_path) {
  try {
    const imagePath = path.join(__dirname, img_path);
    const autoName = path.basename(img_path, path.extname(img_path));
    const result = await cloudinary.uploader.upload(imagePath, {
      resource_type: 'auto' 
    });
    return {
      name: autoName,
      img_link: result.secure_url,
      img_id: result.public_id
    };
  } catch (error) {
    console.error(`=== UPLOAD THẤT BẠI: ${img_path} ===`, error);
    return null;
  }
}
function getAllFiles(dirPath, validExtensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  files.forEach(file => {
    const resPath = path.join(dirPath, file.name);
    console.log(resPath)
    if (file.isDirectory()) {
      // Nếu là thư mục con, tiếp tục chui vào trong quét tiếp (Đệ quy)
      getAllFiles(resPath, validExtensions, arrayOfFiles);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (validExtensions.includes(ext)) {
        arrayOfFiles.push(resPath);
      }
    }
  });
  return arrayOfFiles;
}
async function uploadFolder(folderRelativePath) {
  try {
    const folderPath = path.join(__dirname, folderRelativePath);
    const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.mp4'];
    const allAbsoluteFiles = getAllFiles(folderPath, validExtensions);
    const firestoreModule = await import('../assets/js/firestore.mjs');
    const { addObjectToFirestore } = firestoreModule;
    console.log(`Tìm thấy tổng cộng ${allAbsoluteFiles.length} file. Bắt đầu upload...`);
    for (const absolutePath of allAbsoluteFiles) {
      const fileRelativePath = path.relative(__dirname, absolutePath);
      const parentFolderPath = path.dirname(fileRelativePath)
      const parentFolderName= path.basename(parentFolderPath)
      const filename = path.basename(absolutePath);
      console.log(`-----------------------------------`);
      console.log(`Đang xử lý file: ${filename}`);
      const imgData = await uploadLocalImage(fileRelativePath);
      if (imgData) {
        await addObjectToFirestore(imgData, parentFolderName);
        console.log(`Đã lưu ${filename} thành công vào Firestore!`);
      }
    }
    console.log(`=== HOÀN THÀNH UPLOAD TOÀN BỘ FOLDER ===`);
  } catch (error) {
    console.error("Lỗi khi xử lý folder:", error);
  }
}
async function startUpload() {
  await uploadFolder('../Studiova-1.0.0/assets/images');
}
startUpload();