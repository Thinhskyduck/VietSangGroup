document.addEventListener('DOMContentLoaded', function () {
    const bookingForm = document.querySelector('#bookingForm'); // Form Vệ Sinh
    const movingForm = document.querySelector('#movingForm');   // Form Chuyển Nhà
    const applicationForm = document.querySelector('#applicationForm'); //  Form Tuyển Dụng

    // --- CẤU HÌNH CÁC URL CỦA BẠN TẠI ĐÂY ---
    const scriptUrls = {
        bookingForm: 'https://script.google.com/macros/s/AKfycbwd_NdiKrGokOgEayLujSG7fjkHKiIR_H-00powiC4sBiAD95gN5TxgNNV4ok52EwO7/exec',
        movingForm: 'https://script.google.com/macros/s/AKfycbwajUrGAkNFzzpbJPnpJp-mrEJZwZkBBasPHAd7T-qThbZACW-Twa_FYDJZ5LatVwu_9A/exec',
        applicationForm: 'https://script.google.com/macros/s/AKfycbxnm4rh-oBAmnqSI7hVcA4oaZABz9Xw9ecYpDh0plLAB2mSdep1qL-yFdsHkUjsHzugpg/exec' 
    };
    // ------------------------------------------

    // Hàm xử lý chung cho cả hai form
    function handleFormSubmit(form, url) {
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            form.classList.add('was-validated');
            if (!form.checkValidity()) {
                // Thêm kiểm tra cho checkbox/radio để đảm bảo ít nhất 1 được chọn
                const requiredCheckables = form.querySelectorAll('input[type="checkbox"][required], input[type="radio"][required]');
                requiredCheckables.forEach(rc => {
                    const name = rc.getAttribute('name');
                    if (!form.querySelector(`input[name="${name}"]:checked`)) {
                        // Có thể thêm logic hiển thị lỗi cụ thể nếu muốn
                    }
                });
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang gửi...';

            fetch(url, { method: 'POST', body: new FormData(form)})
                .then(response => response.json()) // Chuyển đổi response thành JSON
                .then(data => {
                    if (data.result === "success") {
                        console.log('Success!', data);
                        window.location.href = '/cam-on-quy-khach/';
                    } else {
                        throw new Error(data.message || 'Lỗi không xác định từ server');
                    }
                })
                .catch(error => {
                    console.error('Error!', error);
                    alert('Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại sau.');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        });
    }

    // Áp dụng hàm xử lý cho từng form với URL tương ứng
    handleFormSubmit(bookingForm, scriptUrls.bookingForm);
    handleFormSubmit(movingForm, scriptUrls.movingForm);
    handleFormSubmit(applicationForm, scriptUrls.applicationForm);
});