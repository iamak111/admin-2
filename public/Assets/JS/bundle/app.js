import 'core-js/actual';
import 'regenerator-runtime/runtime.js';

import {
    sendOtp,
    updateUser,
    verifyOtp
} from './controllers/sharedControllers';
import {
    addToCart,
    addToWishlist,
    buyProduct,
    getAdditionalDetails
} from './controllers/productControllers';
import {
    adNewAddress,
    cancelOrder,
    carttoCheckout,
    confirmOrder,
    deleteAddress,
    placeOrder,
    removeCart,
    removeWishlist,
    updateAddress
} from './controllers/orderControllers';
import {
    createNewCategorie,
    deleteCategory,
    updateVendorStatus
} from './controllers/adminControllers';

const send_otp = document.getElementById('send_otp');
const verify_otp = document.getElementById('verify_otp');
const add_to_wishlist = document.querySelectorAll('.add_to_wishlist');
const small_product_img = document.querySelectorAll('.small-product-img');
const selection_image = document.querySelectorAll('.selection_image');
const product_id = document.getElementById('product_id');
const pagination_manage = document.querySelectorAll('.pagination_manage');
const add_quantity = document.getElementById('add_quantity');
const sub_quantity = document.getElementById('sub_quantity');
const add_to_cart = document.querySelectorAll('.add_to_cart');
const buy_order = document.querySelectorAll('.buy_order');
const add_new_address = document.getElementById('add_new_address');
const delete_address = document.querySelectorAll('.delete_address');
const confirm_order = document.getElementById('confirm_order');
const place_order = document.getElementById('place_order');
const cart_to_checkout = document.getElementById('cart_to_checkout');
const remove_cart = document.querySelectorAll('.remove_cart');
const remove_wishlist = document.querySelectorAll('.remove_wishlist');
const update_address = document.querySelectorAll('.update_address');
const cancel_order = document.querySelectorAll('.cancel_order');
const udpate_user = document.getElementById('udpate_user');
const vendor_verification = document.getElementById('vendor_verification');
const add_new_category = document.getElementById('add_new_category');
const delete_category = document.querySelectorAll('.delete_category');

if (send_otp) {
    send_otp.addEventListener('submit', (e) => {
        e.preventDefault();

        const phone = document.getElementById('phone_num').value;
        if (!phone) return alert('Please enter the phone number.');
        if (phone.length !== 10)
            return alert('Phone number shoule be 10 numbers.');
        return sendOtp(phone);
    });
}

if (verify_otp) {
    verify_otp.addEventListener('click', (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone_num').value;
        const otp = document.getElementById('verification_otp').value;

        if (!phone) return alert('Please enter the phone number.');

        if (!otp) return alert('Please enter the otp.');
        return verifyOtp(phone, otp);
    });
}

if (add_to_wishlist.length) {
    [...add_to_wishlist].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            return addToWishlist(el.dataset.id);
        });
    });
}

if (small_product_img.length) {
    [...small_product_img].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const main_image = document.querySelector('.main-product-img');
            main_image.src = el.src;
        });
    });
}
if (selection_image.length) {
    [...selection_image].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (selection_image.length)
                [...selection_image].map((els) => {
                    if (els.dataset.color === el.dataset.color) {
                        els.classList.add('border-dark');
                    } else els.classList.remove('border-dark');
                });

            return getAdditionalDetails(product_id.dataset.id, {
                color: el.dataset.color
            });
        });
    });
}

window.addEventListener('load', (event) => {
    if (document.querySelector('.selection_image '))
        document.querySelector('.selection_image ').click();
});

if (pagination_manage.length) {
    const url = new URL(window.location.href);
    [...pagination_manage].map((el) => {
        el.addEventListener('click', (e) => {
            if (el.dataset.type === 'pre') {
                const page = url.searchParams.get('page');
                const page_no = document.getElementById('page_no').innerText;
                if (!page || page_no * 1 === 1) {
                    return false;
                }
                url.searchParams.set('page', page * 1 - 1);
                return location.assign(url);
            }
            if (el.dataset.type === 'next') {
                const page = url.searchParams.get('page');
                url.searchParams.set('page', (!!page ? page : 1) * 1 + 1);
                return location.assign(url);
            }
        });
    });
}

// add
if (add_quantity) {
    add_quantity.addEventListener('click', (e) => {
        e.preventDefault();
        const count_quantity = document.getElementById('count_quantity');
        if (count_quantity.innerText * 1 === 10) {
            return false;
        }
        count_quantity.innerText = count_quantity.innerText * 1 + 1;
    });
}

// add
if (sub_quantity) {
    sub_quantity.addEventListener('click', (e) => {
        e.preventDefault();
        const count_quantity = document.getElementById('count_quantity');

        if (count_quantity.innerText * 1 === 1) {
            return false;
        }
        count_quantity.innerText = count_quantity.innerText * 1 - 1;
    });
}

if (add_to_cart.length) {
    [...add_to_cart].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            let color, size;
            const size_selection = document.getElementById('size_selection');
            if (size_selection) size = size_selection.value;

            const color_selection = document.querySelector(
                'img.selection_image.border-dark'
            );
            if (color_selection) color = color_selection.dataset.color;
            const count_quantity =
                document.getElementById('count_quantity').innerText;

            return addToCart(product_id.dataset.id, {
                quantity: count_quantity,
                size,
                color
            });
        });
    });
}

if (buy_order.length) {
    [...buy_order].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            let color, size;
            const size_selection = document.getElementById('size_selection');
            if (size_selection) size = size_selection.value;

            const color_selection = document.querySelector(
                'img.selection_image.border-dark'
            );
            if (color_selection) color = color_selection.dataset.color;
            const count_quantity =
                document.getElementById('count_quantity').innerText;

            return buyProduct([
                {
                    id: product_id.dataset.id,
                    quantity: count_quantity,
                    size,
                    color
                }
            ]);
        });
    });
}

// add new address
if (add_new_address) {
    add_new_address.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const phone1 = document.getElementById('phone1').value;
        const country = document.getElementById('country').value;
        const streetAddress = document.getElementById('streetAddress').value;
        const town = document.getElementById('town').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const landmark = document.getElementById('landmark').value;
        return adNewAddress({
            name,
            phone,
            phone1,
            country,
            streetAddress,
            town,
            state,
            zip,
            landmark
        });
    });
}

// delete address
if (delete_address.length) {
    [...delete_address].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            return deleteAddress(e.target.dataset.address);
        });
    });
}

if (confirm_order) {
    confirm_order.addEventListener('click', (e) => {
        let address = document.querySelector('input[name="address"]:checked');
        if (!address) return alert('Please select the address.');

        return confirmOrder(address.value);
    });
}

if (place_order) {
    place_order.addEventListener('click', (e) => {
        return placeOrder(e.target.dataset.id);
    });
}

if (cart_to_checkout) {
    cart_to_checkout.addEventListener('click', async (e) => {
        e.preventDefault();
        const cart = document.querySelectorAll('.count_quantity');
        const doc = await Promise.all(
            [...cart].map((el) => {
                return { id: el.dataset.id, quantity: el.innerText * 1 };
            })
        );
        return carttoCheckout(doc);
    });
}

if (remove_cart.length) {
    [...remove_cart].map((el) => {
        el.addEventListener('click', (e) => {
            return removeCart(el.dataset.id);
        });
    });
}

if (remove_wishlist.length) {
    [...remove_wishlist].map((el) => {
        el.addEventListener('click', (e) => {
            return removeWishlist(el.dataset.id);
        });
    });
}

if (update_address.length) {
    [...update_address].map((el, i) => {
        el.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementsByClassName('name')[i].value;
            const phone = document.getElementsByClassName('phone')[i].value;
            const phone1 = document.getElementsByClassName('phone1')[i].value;
            const country = document.getElementsByClassName('country')[i].value;
            const streetAddress =
                document.getElementsByClassName('streetAddress')[i].value;
            const town = document.getElementsByClassName('town')[i].value;
            const state = document.getElementsByClassName('state')[i].value;
            const zip = document.getElementsByClassName('zip')[i].value;
            const landmark =
                document.getElementsByClassName('landmark')[i].value;
            return updateAddress(el.dataset.id, {
                name,
                phone,
                phone1,
                country,
                streetAddress,
                town,
                state,
                zip,
                landmark
            });
        });
    });
}

if (cancel_order.length) {
    [...cancel_order].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            return cancelOrder(el.dataset.id);
        });
    });
}

if (udpate_user) {
    udpate_user.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('u_name').value;
        const email = document.getElementById('u_email').value;
        return updateUser({ name, email });
    });
}

if (vendor_verification) {
    vendor_verification.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.dataset.status === 'accepted') {
            return updateVendorStatus(
                'accepted',
                vendor_verification.dataset.id
            );
        } else
            return updateVendorStatus(
                'rejected',
                vendor_verification.dataset.id
            );
    });
}

if (add_new_category) {
    add_new_category.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('website', 'b');
        form.append('file', document.getElementById('image').files[0]);
        return createNewCategorie(form);
    });
}

if (delete_category.length) {
    [...delete_category].map((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const id = e.target.dataset.id;
            return deleteCategory(id);
        });
    });
}
