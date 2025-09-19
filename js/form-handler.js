document.addEventListener('DOMContentLoaded', function () {
    const bookingForm = document.querySelector('#bookingForm'); // Form Vệ Sinh
    const movingForm = document.querySelector('#movingForm');   // Form Chuyển Nhà

    // --- CẤU HÌNH CÁC URL CỦA BẠN TẠI ĐÂY ---
    const scriptUrls = {
        bookingForm: 'https://script.google.com/macros/s/AKfycbwd_NdiKrGokOgEayLujSG7fjkHKiIR_H-00powiC4sBiAD95gN5TxgNNV4ok52EwO7/exec',
        movingForm: 'https://script.google.com/macros/s/AKfycbwajUrGAkNFzzpbJPnpJp-mrEJZwZkBBasPHAd7T-qThbZACW-Twa_FYDJZ5LatVwu_9A/exec'
    };
    // ------------------------------------------

    // Hàm xử lý chung cho cả hai form
    function handleFormSubmit(form, url) {
        if (!form) return; // Nếu không tìm thấy form trên trang, dừng lại

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            form.classList.add('was-validated');
            if (!form.checkValidity()) {
                return;
            }
            
            // Thu thập các dịch vụ được chọn (nếu có)
            const hiddenInput = form.querySelector('input[name="selectedServices"]');
            if(hiddenInput) {
                const checkboxes = form.querySelectorAll('.form-check-input[type="checkbox"]:checked');
                const selectedValues = Array.from(checkboxes).map(cb => cb.value);
                hiddenInput.value = selectedValues.join('; ');
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Đang gửi...';

            fetch(url, { method: 'POST', body: new FormData(form)})
                .then(response => {
                    console.log('Success!', response);
                    window.location.href = 'cam-on-quy-khach.html';
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
});