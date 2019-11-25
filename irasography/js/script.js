$(document).ready(function () {
    let slider = $('#slider');
    if (slider.length && $.fn.owlCarousel) {
        slider.owlCarousel({
            rtl: true,
            items: 3,
            loop: true,
            nav: true,
            dots: false,
            autoplay: false,
            navText: [
                '<i class="fas fa-chevron-right"></i>',
                '<i class="fas fa-chevron-left"></i>'
            ],
            responsive: {
                0: {
                    items: 1
                },
                576: {
                    items: 2
                },
                768: {
                    items: 3
                },
                991: {
                    items: 3
                },
            }

        });
    }

    const drawer = document.getElementById("sidebar");

    document.getElementById("navicon").addEventListener("click", function () {
        drawer.style.display = 'block';
    });
    document.getElementById("closeDrawer").addEventListener("click", function () {
        drawer.style.display = 'none';
    });
})