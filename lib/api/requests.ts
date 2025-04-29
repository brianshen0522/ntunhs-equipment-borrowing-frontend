import { API_BASE_URL } from "@/lib/config"
import type { RequestSummary, RequestDetail } from "@/lib/types"

export interface RequestsListParams {
  page?: number
  limit?: number
  status?: string
  startDateFrom?: string
  startDateTo?: string
  userId?: string
  query?: string
}

export interface RequestsListResponse {
  success: boolean
  data?: {
    total: number
    page: number
    limit: number
    statusCounts?: {
      pending_review: number
      pending_building_response: number
      pending_allocation: number
      completed: number
      rejected: number
      closed: number
      all: number
    }
    requests: RequestSummary[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface RequestDetailResponse {
  success: boolean
  data?: RequestDetail
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface CreateRequestParams {
  startDate: string
  endDate: string
  venue: string
  purpose: string
  items: {
    equipmentId: string
    quantity: number
  }[]
}

export interface CreateRequestResponse {
  success: boolean
  data?: {
    requestId: string
    status: string
    createdAt: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface CloseRequestResponse {
  success: boolean
  data?: {
    requestId: string
    status: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function getRequestsList(params: RequestsListParams = {}): Promise<RequestsListResponse> {
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

    // Build query string
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.status) queryParams.append("status", params.status)
    if (params.startDateFrom) queryParams.append("startDateFrom", params.startDateFrom)
    if (params.startDateTo) queryParams.append("startDateTo", params.startDateTo)
    if (params.userId) queryParams.append("userId", params.userId)
    if (params.query) queryParams.append("query", params.query)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/requests${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get requests list error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function getRequestDetails(requestId: string): Promise<RequestDetailResponse> {
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get request details error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function createRequest(params: CreateRequestParams): Promise<CreateRequestResponse> {
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

    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    const responseData = await response.json()

    // If the response is successful, return it directly
    if (response.ok) {
      return responseData
    }

    // If the response is not successful, handle the error
    console.error("Server error response:", responseData)

    // Check for FastAPI validation error format
    if (responseData.detail && Array.isArray(responseData.detail)) {
      const errorMessages = responseData.detail
        .map((err: any) => err.msg)
        .filter(Boolean)
        .join("; ")

      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: errorMessages || "表單驗證失敗",
          details: responseData,
        },
      }
    }

    // Return the error response
    return {
      success: false,
      error: {
        code: responseData.code || "REQUEST_FAILED",
        message: responseData.message || "申請失敗",
        details: responseData,
      },
    }
  } catch (error) {
    console.error("Create request error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function closeRequest(requestId: string): Promise<CloseRequestResponse> {
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Close request error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function approveInquiry(requestId: string): Promise<{
  success: boolean
  data?: {
    requestId: string
    status: string
    lineNotificationSent: boolean
    responseTokens?: Array<{
      tokenId: string
      token: string
      createdAt: string
      expiresAt: string
      isUsed: boolean
    }>
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/approve-inquiry`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Approve inquiry error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function rejectRequest(
  requestId: string,
  reason: string,
): Promise<{
  success: boolean
  data?: {
    requestId: string
    status: string
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    })

    return await response.json()
  } catch (error) {
    console.error("Reject request error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function getBuildingResponses(requestId: string): Promise<{
  success: boolean
  data?: {
    responses: Array<{
      responseId: string
      buildingId: string
      buildingName: string
      submittedAt: string
      items: Array<{
        itemId: string
        equipmentName: string
        availableQuantity: number
      }>
    }>
    totalAvailable: Array<{
      itemId: string
      equipmentName: string
      requestedQuantity: number
      totalAvailableQuantity: number
    }>
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/building-responses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get building responses error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function allocateEquipment(
  requestId: string,
  allocations: Array<{
    itemId: string
    approvedQuantity: number
    buildingAllocations: Array<{
      buildingId: string
      allocatedQuantity: number
    }>
  }>,
  notes?: string,
): Promise<{
  success: boolean
  data?: {
    requestId: string
    status: string
    pdfUrl: string | null
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/allocate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ allocations, notes }),
    })

    return await response.json()
  } catch (error) {
    console.error("Allocate equipment error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function resendEmail(requestId: string): Promise<{
  success: boolean
  data?: {
    requestId: string
    emailSent: boolean
    sentTo: string
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

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/resend-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Resend email error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
