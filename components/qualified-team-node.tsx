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
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#555", border: "2px solid #fff" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ background: "#555", border: "2px solid #fff" }}
      />

      <div className="bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-400 rounded-lg p-4 min-w-[180px] shadow-lg">
        <div className="text-center">
          <div className="text-xs font-semibold text-green-100 mb-1">QUALIFIED</div>
          <div className="text-white font-bold text-sm">{data.teamName}</div>
        </div>
      </div>
    </div>
  )
})

QualifiedTeamNode.displayName = "QualifiedTeamNode"
