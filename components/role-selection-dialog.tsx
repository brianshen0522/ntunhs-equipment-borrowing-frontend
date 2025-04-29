"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface RoleSelectionDialogProps {
  roles: string[]
  onSelect: (role: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roleLabels: Record<string, string> = {
  applicant: "申請人",
  academic_staff: "教務處人員",
  system_admin: "系統管理員",
}

export function RoleSelectionDialog({ roles, onSelect, open, onOpenChange }: RoleSelectionDialogProps) {
  const [selectedRole, setSelectedRole] = useState(roles[0] || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSelect(selectedRole)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>選擇登入角色</DialogTitle>
          <DialogDescription>您有多個角色，請選擇要以哪個身份登入系統</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3">
            {roles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <RadioGroupItem value={role} id={role} />
                <Label htmlFor={role} className="font-medium">
                  {roleLabels[role] || role}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex justify-end">
            <Button type="submit">確認</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
