import { API_BASE_URL } from "@/lib/config"
import type { Building } from "@/lib/types"

export interface BuildingsListResponse {
  success: boolean
  data?: {
    buildings: Building[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface CreateBuildingParams {
  buildingName: string
}

export interface UpdateBuildingParams {
  buildingName: string
}

export interface BuildingResponse {
  success: boolean
  data?: Building
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function getBuildingsList(include_disabled = false): Promise<BuildingsListResponse> {
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

    const url = include_disabled ? `${API_BASE_URL}/buildings?include_disabled=true` : `${API_BASE_URL}/buildings`
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
    console.error("Get buildings list error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function createBuilding(params: CreateBuildingParams): Promise<BuildingResponse> {
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

    const response = await fetch(`${API_BASE_URL}/buildings`, {
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
    console.error("Create building error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function updateBuilding(buildingId: string, params: UpdateBuildingParams): Promise<BuildingResponse> {
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

    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Update building error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function toggleBuildingStatus(buildingId: string, enabled: boolean): Promise<BuildingResponse> {
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

    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}/toggle-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled }),
    })

    return await response.json()
  } catch (error) {
    console.error("Toggle building status error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function deleteBuilding(buildingId: string): Promise<{
  success: boolean
  data?: {
    buildingId: string
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

    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Delete building error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
