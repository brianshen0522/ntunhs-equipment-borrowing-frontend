export interface UserInfo {
  userId: string
  username: string
  role: string
  allRoles: string[]
}

export interface RequestSummary {
  requestId: string
  userId: string
  username: string
  startDate: string
  endDate: string
  venue: string
  status: string
  createdAt: string
}

// Update the RequestDetail interface to include responseTokens
export interface RequestDetail {
  requestId: string
  userId: string
  username: string
  startDate: string
  endDate: string
  venue: string
  purpose: string
  status: string
  createdAt: string
  responseTokens?: Array<{
    tokenId: string
    token: string
    createdAt: string
    expiresAt: string
    isUsed: boolean
  }>
  items: Array<{
    itemId: string
    equipmentName: string
    requestedQuantity: number
    approvedQuantity: number | null
    allocations: Array<{
      buildingId: string
      buildingName: string
      allocatedQuantity: number
    }>
  }>
  statusHistory: Array<{
    status: string
    timestamp: string
    operatorId: string
    operatorName: string
    notes: string
  }>
}

export interface Equipment {
  equipmentId: string
  equipmentName: string
  description?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Building {
  buildingId: string
  buildingName: string
  enabled: boolean
  createdAt: string
}

export interface BuildingResponse {
  responseId: string
  buildingId: string
  buildingName: string
  submittedAt: string
  items: Array<{
    itemId: string
    equipmentName: string
    availableQuantity: number
  }>
}

export interface TotalAvailable {
  itemId: string
  equipmentName: string
  requestedQuantity: number
  totalAvailableQuantity: number
}
