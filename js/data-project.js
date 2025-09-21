// Tạo helper function để sinh danh sách tên file ảnh
const generateFileNames = (prefix, count) => {
    return Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}.jpg`);
};

// Tạo danh sách ảnh theo từng loại
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

// Mapping ảnh theo từng quận
const quanImageConfig = {
    'khu-vuc-thuduc': [
        chuyenNha[0], chuyenNha[1], veSinh[0], chuyenTro[0]
    ],
    'khu-vuc-tanbinh': [
        chuyenNha[2], chuyenNha[3], veSinh[1], chuyenTro[1]
    ],
    'khu-vuc-quan7': [
        chuyenNha[4], chuyenNha[5], veSinh[2]
    ],
    'khu-vuc-quan2': [
        chuyenNha[6], chuyenNha[7], veSinh[3]
    ],
    'khu-vuc-govap': [
        chuyenNha[8], chuyenNha[9], veSinh[4], chuyenTro[2]
    ],
    'khu-vuc-binhthanh': [
        chuyenNha[10], chuyenNha[11], veSinh[5]
    ],
    'khu-vuc-phunhuan': [
        chuyenNha[12], chuyenNha[13], veSinh[6]
    ],
    'khu-vuc-binhtan': [
        chuyenNha[14], chuyenNha[15], veSinh[7]
    ]
    // 👉 Các ảnh còn lại (nếu chưa phân) bạn có thể tự thêm vào đây
};

// Chuyển thành projectData
const projectData = Object.entries(quanImageConfig).flatMap(([quan, images]) =>
    images.map(img => ({
        imageUrl: `img/project/${img}`,
        category: quan
    }))
);

// (Tùy chọn) Xáo trộn thứ tự ảnh
projectData.sort(() => Math.random() - 0.5);

console.log(projectData);
