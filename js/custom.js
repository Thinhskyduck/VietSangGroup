(function ($) {
  "use strict";
  
  // --- Hàm tạo HTML cho một item phản hồi ---
  function createFeedbackItem(item) {
    const imageName = `viet-sang-dich-vu-ve-sinh-va-chuyen-nha-tron-goi-tphcm-feedback-${item.imageNumber}.jpg`;
    const imagePath = `img/feedback/${imageName}`;

    return `
      <div class="testimonial-item-new">
        <div class="testimonial-img-container">
          <img src="${imagePath}" alt="Phản hồi từ ${item.author}">
        </div>
        <div class="testimonial-text-container">
          <i class="fa fa-quote-left fa-3x text-primary mb-4"></i>
          <p>${item.quote}</p>
          <div class="d-flex align-items-center mt-4">
            <div class="ms-0">
              <h5 class="mb-1">${item.author}</h5>
              <span>${item.info}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Đổ dữ liệu Phản hồi và khởi tạo Carousel ---
  const feedbackContainer = $('.testimonial-carousel');
  
  // Lặp qua mảng feedbackData (từ file data.js) và tạo HTML
  feedbackData.forEach(item => {
    const itemHtml = createFeedbackItem(item);
    feedbackContainer.append(itemHtml);
  });

  // Khởi tạo Owl Carousel SAU KHI đã thêm tất cả các item
  feedbackContainer.owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      items: 1, // Luôn hiển thị 1 item mỗi lần
      dots: false,
      loop: true,
      nav: true,
      navText : [
          '<i class="bi bi-chevron-left"></i>',
          '<i class="bi bi-chevron-right"></i>'
      ]
  });
  // --- Khởi tạo và xử lý Bộ lọc Công trình (Isotope) ---
  var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows',
      // Thêm hiệu ứng chuyển động mượt mà hơn
      transitionDuration: '0.6s'
  });
  
  $('#portfolio-flters li').on('click', function () {
      $("#portfolio-flters li").removeClass('active');
      $(this).addClass('active');
      portfolioIsotope.isotope({ filter: $(this).data('filter') });
      
      // Reset lại trạng thái Xem Thêm / Thu Gọn khi người dùng lọc
      resetPortfolioView();
  });


  // --- Xử lý Modal Lựa Chọn Đặt Lịch ---
  const bookingOptionsModal = new bootstrap.Modal(document.getElementById('bookingOptionsModal'));
  let formPageUrl = ''; // Biến để lưu trữ URL trang form đích

  // Bắt sự kiện khi modal lựa chọn sắp được hiển thị
  $('#bookingOptionsModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const serviceName = button.data('service');
    const formTarget = button.data('form-target'); // Lấy target, ví dụ: '#movingModal'

    // Cập nhật tên dịch vụ trong modal
    $('#modal-service-name').text(`Bạn muốn đặt lịch cho dịch vụ "${serviceName}"?`);
    
    // Xác định URL trang form dựa trên target
    if (formTarget === '#movingModal') {
      // Sửa tên file 'dat-lich-chuyen-nha.html' nếu bạn đặt khác
      formPageUrl = 'dat-lich-chuyen-nha.html'; 
    } else if (formTarget === '#cleaningModal') {
      formPageUrl = 'dat-lich-ve-sinh.html';
    }
  });

  // Sự kiện click cho nút "Điền Form Đặt Lịch"
  $('#option-website').on('click', function() {
    if (formPageUrl) {
      window.location.href = formPageUrl; // Chuyển hướng người dùng
    }
  });
  
  
  // --- Logic nâng cấp cho nút "Xem Thêm" và "Thu Gọn" ---
  var initialItems = 6; // Số lượng item hiển thị ban đầu

  // Hàm ẩn các item thừa
  function hideItems() {
    $('.portfolio-item:gt(' + (initialItems - 1) + ')').addClass('portfolio-hidden');
    // Cập nhật lại layout của Isotope sau khi ẩn
    portfolioIsotope.isotope('layout');
  }

  // Hàm kiểm tra và cập nhật trạng thái các nút
  function updateButtons() {
    var hiddenItems = $('.portfolio-item.portfolio-hidden').length;
    var totalItems = $('.portfolio-item').length;

    if (totalItems <= initialItems) {
      // Nếu có 6 item hoặc ít hơn, ẩn cả 2 nút
      $('#load-more-btn, #collapse-btn').addClass('d-none');
    } else if (hiddenItems > 0) {
      // Nếu còn item đang ẩn, hiện nút "Xem Thêm"
      $('#load-more-btn').removeClass('d-none');
      $('#collapse-btn').addClass('d-none');
    } else {
      // Nếu đã hiện tất cả, hiện nút "Thu Gọn"
      $('#load-more-btn').addClass('d-none');
      $('#collapse-btn').removeClass('d-none');
    }
  }

  // Hàm reset về trạng thái ban đầu (dùng khi lọc)
  function resetPortfolioView() {
    hideItems();
    updateButtons();
  }

  // Chạy lần đầu khi tải trang
  resetPortfolioView();

  // Sự kiện click cho nút "Xem Thêm"
  $('#load-more-btn').on('click', function (e) {
      e.preventDefault();
      
      // Hiện tất cả các item đang ẩn
      $('.portfolio-item.portfolio-hidden').removeClass('portfolio-hidden');
      portfolioIsotope.isotope('layout');
      
      // Cập nhật lại trạng thái nút
      updateButtons();
  });

  // Sự kiện click cho nút "Thu Gọn"
  $('#collapse-btn').on('click', function (e) {
    e.preventDefault();
    
    // Cuộn trang lên đầu khu vực công trình một cách mượt mà
    $('html, body').animate({
        scrollTop: $('#projects').offset().top - 100 // -100 để chừa khoảng trống cho navbar
    }, 300, function() {
        // Sau khi cuộn xong, mới thu gọn
        hideItems();
        updateButtons();
    });
  });
    // --- Logic điều khiển Video trong Carousel (Nâng cấp với nút Âm thanh) ---
  const carousel = document.getElementById('header-carousel');
  const muteBtn = document.getElementById('mute-toggle-btn');
  let player; // Biến để lưu trữ đối tượng player của YouTube

  // 1. Tải YouTube IFrame API
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 2. Hàm này sẽ được gọi tự động sau khi API tải xong
  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
      events: {
        'onReady': onPlayerReady
      }
    });
  }

  // 3. Hàm này sẽ chạy khi video đã sẵn sàng
  function onPlayerReady(event) {
    // Mặc định video sẽ tắt tiếng
    event.target.mute();
    // Bắt đầu lắng nghe các sự kiện của carousel
    setupCarouselListener(event.target);
  }

  // 4. Hàm thiết lập trình lắng nghe sự kiện cho carousel
  function setupCarouselListener(videoPlayer) {
    if (carousel && muteBtn) {
      const muteIcon = muteBtn.querySelector('i');

      // Sự kiện khi click vào nút bật/tắt âm thanh
      muteBtn.addEventListener('click', function() {
        if (videoPlayer.isMuted()) {
          videoPlayer.unMute();
          muteIcon.classList.remove('fa-volume-mute');
          muteIcon.classList.add('fa-volume-up');
        } else {
          videoPlayer.mute();
          muteIcon.classList.remove('fa-volume-up');
          muteIcon.classList.add('fa-volume-mute');
        }
      });

      // Sự kiện khi carousel bắt đầu chuyển slide
      carousel.addEventListener('slide.bs.carousel', function (event) {
        const videoSlideIndex = 3; // Index của slide video (bắt đầu từ 0)

        // Nếu đang rời khỏi slide video
        if (event.from === videoSlideIndex) {
          videoPlayer.pauseVideo(); // Tạm dừng video
          muteBtn.style.display = 'none'; // Ẩn nút âm thanh
        }

        // Nếu sắp chuyển đến slide video
        if (event.to === videoSlideIndex) {
          videoPlayer.playVideo(); // Chạy lại video
          muteBtn.style.display = 'block'; // Hiện lại nút âm thanh
        }
      });
      
      // Kiểm tra trạng thái ban đầu khi tải trang
      if (document.querySelector('.carousel-item.active') === document.querySelector('.carousel-video-item')) {
         muteBtn.style.display = 'block';
      } else {
         muteBtn.style.display = 'none';
      }
    }
  }
})(jQuery);