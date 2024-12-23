import axios from 'axios';

export const updateVendorStatus = async (status, id) => {
    try {
        await axios({
            method: 'PATCH',
            url: `/api/v1/admin/vendor-management/${status}/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('Vendor status updated.');
                return location.assign(
                    '/admin/vendors-management/verification-requests'
                );
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const createNewCategorie = async (data) => {
    try {
        await axios({
            method: 'POST',
            url: `/api/v1/admin/category`,
            data
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('category created successfully.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};

export const deleteCategory = async (id) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/admin/category/${id}`
        }).then((res) => {
            if (res.data.status === 'Success') {
                alert('category deleted successfully.');
                return location.reload();
            }
        });
    } catch (err) {
        if (err?.response?.data?.message) {
            return alert(err.response.data.message);
        } else return alert('Somthing went wrong. Please try again.');
    }
};
