import { API_BASE_URL } from './apiConfig';

export const toggleLike = async (postId: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE_URL}/volunteers/${postId}/like/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    });

    // If it's a 204 No Content, there's no JSON to parse
    if (res.status === 204) return true;

    try {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
        return data; 
    } catch (e) {
        if (!res.ok) throw new Error("حدث خطأ أثناء تسجيل الإعجاب");
        return { success: true };
    }
}