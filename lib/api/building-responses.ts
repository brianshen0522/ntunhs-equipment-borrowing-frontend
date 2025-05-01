import { API_BASE_URL } from "@/lib/config"

export interface BuildingResponseItem {
  itemId: string
  availableQuantity: number
}

export interface SubmitBuildingResponseParams {
  buildingId: string
  items: BuildingResponseItem[]
}

export interface BuildingResponseSubmitResponse {
  success: boolean
  data?: {
    responseId: string
    requestId: string
    buildingId: string
    buildingName: string
    submittedAt: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface BuildingResponse {
  buildingId: string
  buildingName: string
  items: Array<{
    itemId: string
    equipmentName: string
    availableQuantity: number
  }>
  submittedAt: string
}

export interface GetRequestForBuildingManagerResponse {
  success: boolean
  data?: {
    requestId: string
    username?: string
    purpose?: string
    requestDetails?: {
      startDate: string
      endDate: string
      venue: string
    }
    items: Array<{
      itemId: string
      equipmentName: string
      requestedQuantity: number
    }>
    buildings: Array<{
      buildingId: string
      buildingName: string
    }>
    responseData?: {
      buildingId: string | null
      items: Array<any>
    }
    allBuildingResponses?: BuildingResponse[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Add a helper function to extract error message from the new error format
function extractErrorMessage(data: any): { code?: string; message: string } {
  if (data.detail && !data.detail.success && data.detail.error) {
    return {
      code: data.detail.error.code,
      message: data.detail.error.message,
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "未知錯誤，請稍後再試",
  }
}

// Update the getRequestForBuildingManager function to use the correct endpoint
export async function getRequestForBuildingManager(
  responseToken: string,
): Promise<GetRequestForBuildingManagerResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/building-response/${responseToken}`, {
      method: "GET",
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
    console.error("Get request for building manager error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// Also update the submitBuildingResponse function to use the correct endpoint
export async function submitBuildingResponse(
  responseToken: string,
  params: SubmitBuildingResponseParams,
): Promise<BuildingResponseSubmitResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/building-response/${responseToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    const responseData = await response.json()

    // Handle the new error format
    if (responseData.detail && !responseData.detail.success) {
      return {
        success: false,
        error: responseData.detail.error || {
          code: "UNKNOWN_ERROR",
          message: "未知錯誤，請稍後再試",
        },
      }
    }

    return responseData
  } catch (error) {
    console.error("Submit building response error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
