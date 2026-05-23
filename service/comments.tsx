import { API_BASE_URL } from './apiConfig';

export const addComment = async (postId : number , comment : string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE_URL}/volunteers/${postId}/comments/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: comment })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data) || "بيانات التعليق غير صحيحة")
    return data
}