import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    timeout: 15000,
    headers: {
        Accept: "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const responseData = error.response?.data;
        const fieldErrors = responseData?.fieldErrors;
        const validationMessage = fieldErrors && Object.values(fieldErrors).join(" ");
        const message = validationMessage
            || responseData?.message
            || (typeof responseData === "string" ? responseData : null)
            || (error.response
                ? `The backend returned HTTP ${error.response.status}.`
                : "The rental backend is unavailable. Start the backend and retry.");

        return Promise.reject(new Error(message));
    },
);

export async function getAllPages(path, pageSize = 100) {
    const records = [];
    let page = 0;
    let isLastPage = false;

    while (!isLastPage) {
        const { data } = await apiClient.get(path, { params: { page, size: pageSize } });
        records.push(...data.content);
        isLastPage = data.last;
        page += 1;
    }

    return records;
}

export default apiClient;
