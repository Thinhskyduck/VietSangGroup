// Tạo helper function để sinh danh sách tên file ảnh
// ĐÃ CẬP NHẬT: Thêm tham số 'ext' với giá trị mặc định là 'jpg'
const generateFileNames = (prefix, count, ext = 'jpg') => {
    return Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}.${ext}`);
};

// --- TẠO DANH SÁCH ẢNH .JPG (Như cũ) ---
const chuyenNha = generateFileNames(
    'dich-vu-chuyen-nha-tron-goi-viet-sang-chuyen-nghiep-gia-tot-tphcm',
    26
);
const chuyenTro = generateFileNames(
    'dich-vu-chuyen-tro-sinh-vien-tron-goi-viet-sang-chuyen-nghiep-gia-re-tphcm',
    3
);
const veSinh = generateFileNames(
    'dich-vu-ve-sinh-viet-sang-chuyen-nghiep-gia-tot-tphcm',
    11
);

// --- TẠO THÊM DANH SÁCH ẢNH .WEBP (MỚI) ---
const chuyenNha_webp = generateFileNames(
    'dich-vu-chuyen-nha-webp', // (Tên prefix của bạn)
    16,                       // (Tổng số 16 ảnh)
    'webp'                    // (Phần mở rộng mới)
);

const veSinh_webp = generateFileNames(
    'dich-vu-ve-sinh-webp',   // (Tên prefix của bạn)
    2,                        // (Tổng số 2 ảnh)
    'webp'                    // (Phần mở rộng mới)
);

// --- Mapping ảnh theo từng quận ---
// (ĐÃ CẬP NHẬT: Phân phối đầy đủ 16 ảnh webp chuyển nhà + 2 ảnh webp vệ sinh)
const quanImageConfig = {
    'khu-vuc-thuduc': [
        // Ảnh jpg/tro cũ
        chuyenNha[0], chuyenNha[1], chuyenNha[18], chuyenNha[19], 
        chuyenTro[0], veSinh[4],
        // Thêm ảnh webp
        veSinh_webp[0], // (Ảnh veSinh webp 1/2)
        chuyenNha_webp[0], chuyenNha_webp[1] // (Ảnh chuyenNha webp 1, 2/16)
    ],
    'khu-vuc-tanbinh': [
        // Ảnh jpg/tro cũ
        chuyenNha[0], chuyenNha[23], veSinh[2], chuyenTro[2], 
        veSinh[5], veSinh[9],
        // Thêm ảnh webp
        veSinh_webp[1], // (Ảnh veSinh webp 2/2)
        chuyenNha_webp[2], chuyenNha_webp[3] // (Ảnh chuyenNha webp 3, 4/16)
    ],
    'khu-vuc-quan7': [
        // Ảnh jpg/tro cũ
        chuyenNha[5], chuyenNha[10], chuyenNha[16], chuyenNha[25], 
        chuyenTro[2], veSinh[1],
        // Thêm ảnh webp
        chuyenNha_webp[4], chuyenNha_webp[5] // (Ảnh chuyenNha webp 5, 6/16)
    ],
    'khu-vuc-quan2': [
        // Ảnh jpg/tro cũ
        chuyenNha[8], chuyenNha[12], chuyenNha[14], chuyenNha[17], 
        veSinh[0], veSinh[8],
        // Thêm ảnh webp
        chuyenNha_webp[6], chuyenNha_webp[7] // (Ảnh chuyenNha webp 7, 8/16)
    ],
    'khu-vuc-govap': [
        // Ảnh jpg/tro cũ
        chuyenNha[15], chuyenNha[20], veSinh[10], chuyenTro[2], 
        veSinh[2], veSinh[7],
        // Thêm ảnh webp
        chuyenNha_webp[8], chuyenNha_webp[9] // (Ảnh chuyenNha webp 9, 10/16)
    ],
    'khu-vuc-binhthanh': [
        // Ảnh jpg/tro cũ
        chuyenNha[3], chuyenNha[6], chuyenNha[22], chuyenTro[1], 
        veSinh[3], veSinh[10],
        // Thêm ảnh webp
        chuyenNha_webp[10], chuyenNha_webp[11] // (Ảnh chuyenNha webp 11, 12/16)
    ],
    'khu-vuc-phunhuan': [
        // Ảnh jpg/tro cũ
        chuyenNha[0], chuyenNha[5], chuyenTro[2], chuyenTro[2], 
        veSinh[4], veSinh[6],
        // Thêm ảnh webp
        chuyenNha_webp[12], chuyenNha_webp[13] // (Ảnh chuyenNha webp 13, 14/16)
    ],
    'khu-vuc-binhtan': [
        // Ảnh jpg/tro cũ
        veSinh[7], chuyenTro[1], chuyenNha[10], chuyenNha[15], 
        chuyenTro[0], chuyenNha[5],
        // Thêm ảnh webp
        chuyenNha_webp[14], chuyenNha_webp[15] // (Ảnh chuyenNha webp 15, 16/16)
    ]
};

// Chuyển thành projectData (Code này không cần thay đổi)
const projectData = Object.entries(quanImageConfig).flatMap(([quan, images]) =>
    images.map(img => ({
        imageUrl: `../img/project/${img}`,
        category: quan
    }))
);

// (Tùy chọn) Xáo trộn thứ tự ảnh (Code này không cần thay đổi)
projectData.sort(() => Math.random() - 0.5);

// console.log(projectData); // Bỏ comment nếu bạn muốn kiểm tra kết quả