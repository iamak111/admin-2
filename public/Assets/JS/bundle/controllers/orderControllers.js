import axios from 'axios';

export const adNewAddress = async (data) => {
    try {
        await axios({
            method: 'POST',
            url: '/api/v1/user/address',
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Address successfully added.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const updateAddress = async (id, data) => {
    try {
        await axios({
            method: 'PATCH',
            url: `/api/v1/user/address/${id}`,
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Address successfully updated.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const deleteAddress = async (id) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/user/address/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Address successfully deleted.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const confirmOrder = async (id) => {
    try {
        return location.assign(`/order/confirm/${id}`);
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const placeOrder = async (id) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/user/product/order/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Order successfully placed.');
                return location.assign('/thank-you');
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const carttoCheckout = async (data) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/user/cart/checkout`,
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

export const removeCart = async (id) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/user/cart/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Cart deleted successfully.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const removeWishlist = async (id) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/user/wishlist/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Wishlist deleted successfully.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};
export const cancelOrder = async (id) => {
    try {
        await axios({
            method: 'PATCH',
            url: `/api/v1/user/orders/cancel-order/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Your order canceled successfully.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};
