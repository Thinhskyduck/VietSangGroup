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
        chuyenNha[0], chuyenNha[1], chuyenNha[18], chuyenNha[19], chuyenTro[0], veSinh[4]
    ],
    'khu-vuc-tanbinh': [
        chuyenNha[0], chuyenNha[23], veSinh[2], chuyenTro[2], veSinh[5], veSinh[9]
    ],
    'khu-vuc-quan7': [
        chuyenNha[5], chuyenNha[10], chuyenNha[16], chuyenNha[25], chuyenTro[2], veSinh[1]
    ],
    'khu-vuc-quan2': [
        chuyenNha[8], chuyenNha[12],chuyenNha[14], chuyenNha[17], veSinh[0],veSinh[8] 
    ],
    'khu-vuc-govap': [
        chuyenNha[15], chuyenNha[20], veSinh[10], chuyenTro[2], veSinh[2], veSinh[7]
    ],
    'khu-vuc-binhthanh': [
        chuyenNha[3], chuyenNha[6], chuyenNha[22], chuyenTro[1], veSinh[3], veSinh[10]
    ],
    'khu-vuc-phunhuan': [
        chuyenNha[0], chuyenNha[5], chuyenTro[2], chuyenTro[2], veSinh[4], veSinh[6]
    ],
    'khu-vuc-binhtan': [
        veSinh[7], chuyenTro[1], chuyenNha[10], chuyenNha[15],  chuyenTro[0], chuyenNha[5]
    ]
};

// Chuyển thành projectData
const projectData = Object.entries(quanImageConfig).flatMap(([quan, images]) =>
    images.map(img => ({
        imageUrl: `../img/project/${img}`,
        category: quan
    }))
);

// (Tùy chọn) Xáo trộn thứ tự ảnh
projectData.sort(() => Math.random() - 0.5);

console.log(projectData);
