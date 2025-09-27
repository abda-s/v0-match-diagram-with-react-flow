import { memo } from "react"
import { Handle, Position } from "@xyflow/react"

interface QualifiedTeamNodeProps {
  data: {
    teamName: string
  }
}

export const QualifiedTeamNode = memo(({ data }: QualifiedTeamNodeProps) => {
  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-400 rounded-lg p-4 min-w-[200px] shadow-lg">
        <div className="text-center">
          <div className="text-s font-semibold text-green-100 mb-1">QUALIFIED</div>
          <div className="text-white font-bold text-lg">{data.teamName}</div>
        </div>
      </div>
    </div>
  )
})

QualifiedTeamNode.displayName = "QualifiedTeamNode"
