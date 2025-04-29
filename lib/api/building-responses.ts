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
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function getRequestForBuildingManager(
  responseToken: string,
): Promise<GetRequestForBuildingManagerResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/building-response/${responseToken}`, {
      method: "GET",
    })

    return await response.json()
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

    return await response.json()
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
