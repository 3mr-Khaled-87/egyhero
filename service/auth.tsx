import { API_BASE_URL as API } from './apiConfig'

interface UserData {
    email: string,
    password: string
}

export const registerUser = async (userData: UserData & Record<string, string>) => {
    const res = await fetch(`${API}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data) || "بيانات غير صحيحة")
    return data
}


export const userLogin = async (userData: UserData) => {
    const res = await fetch(`${API}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
    const data = await res.json()

    if (!res.ok) throw new Error(JSON.stringify(data) || "بيانات التسجيل غير صحيحة")

    return data
}