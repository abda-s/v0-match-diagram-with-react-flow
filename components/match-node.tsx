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
    return hasScores ? 'bg-primary' : 'bg-gray-500';
  }

  // Determine what to show in the middle section
  const getMiddleContent = () => {
    if (data.status === 'Completed') {
      return `${data.winnerDisplay}`; // Assuming data.winnerDisplay holds the winner's name
    }
    if (data.status === 'In Progress' && data.score1 && data.score2) {
      return `${data.score1} - ${data.score2}`;
    }
    if (data.arena) {
      return `Arena: ${data.arena}`;
    }
    return data.status || 'Not Started';
  }

  // Determine the background color for team 1: red if winner, gray otherwise
  const team1BgClass = data.winner === data.team1Number && data.status === 'Completed' ? 'bg-primary' : 'bg-gray-500';
  // Determine the background color for team 2: red if winner, gray otherwise
  const team2BgClass = data.winner === data.team2Number && data.status === 'Completed' ? 'bg-primary' : 'bg-gray-500';

  // Use a standard gray border for both teams
  const standardBorderClass = 'border-2 border-gray-300';
  return (
    <div className="bg-white rounded-lg shadow-lg min-w-[200px]">
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="target" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />

      {/* Team 1 */}
      <div className={`${team1BgClass} px-2 py-0.5 ${standardBorderClass} rounded-t-lg text-center font-bold text-m flex items-center justify-center`}>
        <span className="text-white">{data.team1Display}</span>
      </div>

      {/* Middle section - scores, arena, or status */}
      <div className="bg-gray-100 px-1 py-0.5 text-center font-medium text-black text-lg border-x-2 border-gray-300 ">
        {getMiddleContent()}
      </div>

      {/* Team 2 */}
      <div className={`${team2BgClass} px-2 py-0.5 ${standardBorderClass} rounded-b-lg text-center font-semibold text-m flex items-center justify-center`}>
        <span className="text-white">{data.team2Display}</span>

      </div>

      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-gray-400" />
    </div>
  )
}