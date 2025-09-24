import { Handle, Position, type NodeProps } from "@xyflow/react"
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface MatchData {
  arena: string
  team1Number: string
  team1Name: string
  team1Display: string
  team2Number: string
  team2Name: string
  team2Display: string
  score1?: string
  score2?: string
  status?: string
  winner?: string
  winnerDisplay?: string
  isBye: boolean
}

export function MatchNode({ data }: NodeProps<MatchData>) {
  // Check if we have scores for the match
  const hasScores = data.score1 || data.score2;
  
  // Determine background color based on whether scores are known
  const getTeamColor = () => {
    return hasScores ? 'bg-red-500' : 'bg-gray-500';
  }

  // Determine what to show in the middle section
  const getMiddleContent = () => {
    if (data.status === 'Completed') {
      return `Winner: ${data.winnerDisplay || data.winner}`;
    }
    if (data.status === 'In Progress' && data.score1 && data.score2) {
      return `${data.score1} - ${data.score2}`;
    }
    if (data.arena) {
      return `Arena: ${data.arena}`;
    }
    return data.status || 'Not Started';
  }

  // Display "TBP" for empty team names
  const getTeamName = (teamName: string) => {
    return teamName?.trim() === '' ? 'TBP' : teamName;
  }

  // Determine border for team 1
  const team1BorderClass = data.winner === data.team1Number && data.status === 'Completed' ? 'border-3 border-green-500' : 'border-2 border-gray-300';
  // Determine border for team 2
  const team2BorderClass = data.winner === data.team2Number && data.status === 'Completed' ? 'border-3 border-green-500' : 'border-2 border-gray-300';

  return (
    <div className="bg-white rounded-lg shadow-lg min-w-[180px]">
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />

      {/* Team 1 */}
      <div className={`${getTeamColor()} px-4 py-2 ${team1BorderClass} rounded-t-lg text-center font-semibold text-sm flex items-center justify-between`}>
        <span className="text-white">{getTeamName(data.team1Display)}</span>

      </div>

      {/* Middle section - scores, arena, or status */}
      <div className="bg-white px-4 py-2 text-center font-medium text-black text-sm border-y border-gray-200">
        {getMiddleContent()}
      </div>

      {/* Team 2 */}
      <div className={`${getTeamColor()} px-4 py-2 ${team2BorderClass} rounded-b-lg text-center font-semibold text-sm flex items-center justify-between`}>
        <span className="text-white">{getTeamName(data.team2Display)}</span>

      </div>

      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />
    </div>
  )
}