import { API_BASE_URL } from "@/lib/config"
import type { Equipment } from "@/lib/types"

export interface EquipmentsListResponse {
  success: boolean
  data?: {
    equipments: Equipment[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface CreateEquipmentParams {
  equipmentName: string
  description?: string
  enabled?: boolean
}

export interface UpdateEquipmentParams {
  equipmentName: string
  description?: string
  enabled?: boolean
}

export interface EquipmentResponse {
  success: boolean
  data?: Equipment
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function getEquipmentsList(include_disabled = false): Promise<EquipmentsListResponse> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const url = include_disabled ? `${API_BASE_URL}/equipments?include_disabled=true` : `${API_BASE_URL}/equipments`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    // Handle the new error format
    if (data.detail && !data.detail.success) {
      return {
        success: false,
        error: data.detail.error || {
          code: "UNKNOWN_ERROR",
          message: "未知錯誤，請稍後再試",
        },
      }
    }

    return data
  } catch (error) {
    console.error("Get equipments list error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function createEquipment(params: CreateEquipmentParams): Promise<EquipmentResponse> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/equipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    // Handle the new error format
    if (data.detail && !data.detail.success) {
      return {
        success: false,
        error: data.detail.error || {
          code: "UNKNOWN_ERROR",
          message: "未知錯誤，請稍後再試",
        },
      }
    }

    return data
  } catch (error) {
    console.error("Create equipment error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function updateEquipment(equipmentId: string, params: UpdateEquipmentParams): Promise<EquipmentResponse> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Update equipment error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function toggleEquipmentStatus(equipmentId: string, enabled: boolean): Promise<EquipmentResponse> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}/toggle-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled }),
    })

    return await response.json()
  } catch (error) {
    console.error("Toggle equipment status error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function deleteEquipment(equipmentId: string): Promise<{
  success: boolean
  data?: {
    equipmentId: string
    deleted: boolean
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Delete equipment error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
