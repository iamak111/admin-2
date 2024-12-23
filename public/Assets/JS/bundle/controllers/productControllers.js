import axios from 'axios';

export const addToWishlist = async (id) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/user/wishlist/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                return alert('Product added your wishlist.');
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};
export const addToCart = async (id, data) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/user/cart/${id}`,
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                return alert('Product added your cart.');
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const buyProduct = async (data) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/user/product/assign-order`,
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                return location.assign('/order/checkout');
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

const listenerForImgGallery = () => {
    [...document.querySelectorAll('.small-product-img')].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const main_image = document.querySelector('.main-product-img');
            main_image.src = el.src;
        });
    });
};

const setSizeDetails = (vals) => {
    const size_selection = document.getElementById('size_selection');
    size_selection.addEventListener('change', (e) => {
        vals.map((el) => {
            if (el.ecmpssId === e.target.value) {
                const pri_html = el.discountPrice
                    ? `
            <span>Rs. ${el.discountPrice}</span>
            <span class="text-decoration-line-through text-secondary fw-normal fs-6">Rs.${
                el.price
            }</span>
            <span class="main-light fs-6"> (${Math.floor(
                ((el.price - el.discountPrice) / el.price) * 100
            )}% OFF)</span>
            `
                    : ` <span>Rs. ${el.price}</span>`;
                const htmls = document.getElementById('price_details');
                htmls.replaceChildren();
                htmls.insertAdjacentHTML('beforeend', pri_html);
            }
        });
    });
};

export const getAdditionalDetails = async (id, data) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/product/additional-details/${id}`,
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                const vals = res.data.docs;
                if (vals.type === 'colorOnly') {
                    const main_image =
                        document.querySelector('.main-product-img');
                    const gal_img = document.getElementById('gal_image');
                    gal_img.replaceChildren();
                    const html = vals.imageGallery
                        .map((el) => {
                            return `<img class="m-0 small-product-img" src="${el}" alt="mouse corsair">`;
                        })
                        .join('');
                    gal_img.insertAdjacentHTML('beforeend', html);
                    main_image.src = vals.bannerImage;

                    const pri_html = vals.subDetails[0].discountPrice
                        ? `
                <span>Rs. ${vals.subDetails[0].discountPrice}</span>
                <span class="text-decoration-line-through text-secondary fw-normal fs-6">Rs.${
                    vals.subDetails[0].price
                }</span>
                <span class="main-light fs-6"> (${Math.floor(
                    ((vals.subDetails[0].price -
                        vals.subDetails[0].discountPrice) /
                        vals.subDetails[0].price) *
                        100
                )}% OFF)</span>
                `
                        : ` <span>Rs. ${vals.subDetails[0].price}</span>`;
                    const price_details =
                        document.getElementById('price_details');
                    price_details.replaceChildren();
                    price_details.insertAdjacentHTML('beforeend', pri_html);

                    return listenerForImgGallery();
                } else if (vals.type === 'colorWithSize') {
                    const main_image =
                        document.querySelector('.main-product-img');
                    const gal_img = document.getElementById('gal_image');
                    gal_img.replaceChildren();
                    const html = vals.imageGallery
                        .map((el) => {
                            return `<img class="m-0 small-product-img" src="${el}" alt="mouse corsair">`;
                        })
                        .join('');
                    gal_img.insertAdjacentHTML('beforeend', html);
                    main_image.src = vals.bannerImage;
                    const size_selection =
                        document.getElementById('size_selection');
                    size_selection.replaceChildren();
                    const price_details =
                        document.getElementById('price_details');
                    const size_html = vals.subDetails
                        .map((el, i) => {
                            if (i === 0) {
                                const pri_html = el.discountPrice
                                    ? `
                                <span>Rs. ${el.discountPrice}</span>
                                <span class="text-decoration-line-through text-secondary fw-normal fs-6">Rs.${
                                    el.price
                                }</span>
                                <span class="main-light fs-6"> (${Math.floor(
                                    ((el.price - el.discountPrice) / el.price) *
                                        100
                                )}% OFF)</span>
                                `
                                    : ` <span>Rs. ${el.price}</span>`;
                                price_details.replaceChildren();
                                price_details.insertAdjacentHTML(
                                    'beforeend',
                                    pri_html
                                );
                                return `<option value=${el.ecmpssId} selected>${el.size}</option>`;
                            } else {
                                return `<option value=${el.ecmpssId} >${el.size}</option>`;
                            }
                        })
                        .join('');
                    size_selection.insertAdjacentHTML('beforeend', size_html);

                    listenerForImgGallery();
                    return setSizeDetails(vals.subDetails);
                }
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};
