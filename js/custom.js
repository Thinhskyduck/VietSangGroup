(function ($) {
  "use strict";
  
  // --- HÀM TẠO HTML CHO MỘT ITEM PHẢN HỒI ---
  function createFeedbackItem(item) {
    const imageName = `viet-sang-dich-vu-ve-sinh-va-chuyen-nha-tron-goi-tphcm-feedback-${item.imageNumber}.jpg`;
    const imagePath = `img/feedback/${imageName}`;

    return `
      <div class="testimonial-item-new">
        <div class="testimonial-img-container">
          <img src="${imagePath}" alt="Phản hồi từ ${item.author}" loading="lazy">
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

  // --- ĐỔ DỮ LIỆU PHẢN HỒI VÀ KHỞI TẠO CAROUSEL ---
  const feedbackContainer = $('.testimonial-carousel');
  if (typeof feedbackData !== 'undefined' && feedbackContainer.length) {
    feedbackData.forEach(item => {
      const itemHtml = createFeedbackItem(item);
      feedbackContainer.append(itemHtml);
    });

    feedbackContainer.owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });
  }

  // --- TẠO LƯỚI ẢNH CÔNG TRÌNH TỰ ĐỘNG ---
  const projectContainer = $('.portfolio-container');
  if (typeof projectData !== 'undefined' && projectContainer.length) {
    projectData.forEach(item => {
      const itemHtml = `
        <div class="col-lg-4 col-md-6 portfolio-item ${item.category}">
          <div class="portfolio-img rounded overflow-hidden">
            <img class="img-fluid" src="${item.imageUrl}" alt="Công trình Việt Sáng" loading="lazy">
            <div class="portfolio-btn">
              <a class="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="${item.imageUrl}" data-lightbox="portfolio">
                <i class="fa fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      `;
      projectContainer.append(itemHtml);
    });
  }
  
  // --- KHỞI TẠO VÀ XỬ LÝ BỘ LỌC CÔNG TRÌNH (ISOTOPE) ---
  var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows',
      transitionDuration: '0.6s'
  });
  
  $('#portfolio-flters li').on('click', function () {
      $("#portfolio-flters li").removeClass('active');
      $(this).addClass('active');
      
      var filterValue = $(this).data('filter');
      portfolioIsotope.isotope({ filter: filterValue });

      setTimeout(function() {
          resetPortfolioView(filterValue);
      }, 300);
  });

  // --- LOGIC NÂNG CẤP CHO NÚT "XEM THÊM" VÀ "THU GỌN" ---
  var initialItems = 6;

  function hideItems(filter = "*") {
    projectContainer.find('.portfolio-item').addClass('portfolio-hidden');
    const itemsToShow = (filter === "*") ? projectContainer.find('.portfolio-item') : projectContainer.find(filter);
    itemsToShow.slice(0, initialItems).removeClass('portfolio-hidden');
    portfolioIsotope.isotope('layout');
  }

  function updateButtons(filter = "*") {
    const hiddenItems = projectContainer.find('.portfolio-hidden' + (filter === "*" ? '' : filter)).length;
    const totalItems = projectContainer.find('.portfolio-item' + (filter === "*" ? '' : filter)).length;
    
    if (totalItems <= initialItems) {
      $('#load-more-btn, #collapse-btn').addClass('d-none');
    } else if (hiddenItems > 0) {
      $('#load-more-btn').removeClass('d-none');
      $('#collapse-btn').addClass('d-none');
    } else {
      $('#load-more-btn').addClass('d-none');
      $('#collapse-btn').removeClass('d-none');
    }
  }
  
  function resetPortfolioView(filter = "*") {
    hideItems(filter);
    updateButtons(filter);
  }

  // Chạy lần đầu khi tải trang
  resetPortfolioView();

  $('#load-more-btn').on('click', function (e) {
      e.preventDefault();
      var currentFilter = $('#portfolio-flters li.active').data('filter') || "*";
      projectContainer.find('.portfolio-hidden' + (currentFilter === "*" ? '' : currentFilter)).removeClass('portfolio-hidden');
      portfolioIsotope.isotope('layout');
      updateButtons(currentFilter);
  });

  $('#collapse-btn').on('click', function (e) {
    e.preventDefault();
    var currentFilter = $('#portfolio-flters li.active').data('filter') || "*";
    $('html, body').animate({
        scrollTop: $('#projects').offset().top - 100
    }, 300, function() {
        resetPortfolioView(currentFilter);
    });
  });

  // --- XỬ LÝ MODAL LỰA CHỌN ĐẶT LỊCH ---
  const bookingOptionsModalEl = document.getElementById('bookingOptionsModal');
  if (bookingOptionsModalEl) {
    const bookingOptionsModal = new bootstrap.Modal(bookingOptionsModalEl);
    let formPageUrl = '';

    $('#bookingOptionsModal').on('show.bs.modal', function (event) {
      const button = $(event.relatedTarget);
      const serviceName = button.data('service');
      const formTarget = button.data('form-target');
      
      $('#modal-service-name').text(`Bạn muốn đặt lịch cho dịch vụ "${serviceName}"?`);
      
      if (formTarget === '#movingModal') {
        formPageUrl = 'dat-lich-chuyen-nha.html'; 
      } else if (formTarget === '#cleaningModal') {
        formPageUrl = 'dat-lich-ve-sinh.html';
      }
    });

    $('#option-website').on('click', function() {
      if (formPageUrl) {
        window.location.href = formPageUrl;
      }
    });
  }
  
  // --- TỰ ĐỘNG TẠO NỀN MỜ CHO CAROUSEL TRÊN MOBILE ---
  function setCarouselBlurBackground() {
    if (window.innerWidth <= 768) {
      $('#header-carousel .carousel-item').each(function() {
        var $item = $(this);
        var imgSrc = $item.find('img').attr('src');
        
        if (imgSrc && !$item.hasClass('has-blur-bg')) {
          $item.addClass('has-blur-bg');
          // Sử dụng biến CSS để gán ảnh nền, an toàn hơn
          this.style.setProperty('--bg-image', `url(${imgSrc})`);
        }
      });
    }
  }

  // Chạy khi trang tải xong
  $(document).ready(function() {
    setCarouselBlurBackground();
  });

  // Chạy lại khi thay đổi kích thước cửa sổ
  var resizeTimer;
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setCarouselBlurBackground, 250);
  });

  // Thêm rule CSS vào trang để sử dụng biến --bg-image
  if (!$('style#carousel-blur-style').length) {
    $('<style id="carousel-blur-style">')
      .prop('type', 'text/css')
      .html('#header-carousel .carousel-item.has-blur-bg::before { background-image: var(--bg-image); }')
      .appendTo('head');
  }

})(jQuery);