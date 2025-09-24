import { Handle, Position, type NodeProps } from "@xyflow/react"

interface MatchData {
  team1: string
  team2: string
  arena: string
}

export function MatchNode({ data }: NodeProps<MatchData>) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg min-w-[180px]">
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />

      {/* Team 1 - Red background */}
      <div className="bg-red-500 text-white px-4 py-2 rounded-t-lg text-center font-semibold text-sm">{data.team1}</div>

      {/* Arena - White background */}
      <div className="bg-white px-4 py-2 text-center font-medium text-black text-sm border-y border-gray-200">
        {data.arena}
      </div>

      {/* Team 2 - White background */}
      <div className="bg-red-500 text-white px-4 py-2 rounded-b-lg text-center font-semibold text-sm">
        {data.team2}
      </div>

      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
