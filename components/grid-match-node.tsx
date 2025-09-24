import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface GridMatchData {
  team1Number: string
  team2Number: string
  arena?: string
  score1?: string
  score2?: string
  status?: string
  winner?: string // This will be 'team1Number' or 'team2Number' if there's a winner
  winnerDisplay?: string
  isBye: boolean
}

export function GridMatchNode({ data }: { data: GridMatchData }) {
  if (data.isBye) {
    return (
      <div className="bg-white rounded-lg shadow-lg w-25">
        {/* Team 1 - Red background */}
        <div className="border-gray-300 border-2 bg-red-500 text-white px-2 py-0.5 rounded-t-lg text-center font-semibold text-sm">
          {data.team1Number}
        </div>
        <div className="bg-white px-1 py-0.5 text-center font-medium text-white text-xs border-y border-gray-200">
          BYE
        </div>
        {/* Team 2 - Gray background for BYE */}
        <div className="border-gray-300 border-2 bg-gray-500 text-white px-2 py-0.5 rounded-b-lg text-center font-semibold text-sm">
          {data.team2Number}
        </div>
      </div>
    )
  }

  const hasScores = data.score1 || data.score2;
  
  const getTeamColor = () => {
    return hasScores ? 'bg-red-500' : 'bg-gray-500';
  }

  const getMiddleContent = () => {
    if (data.status === 'Completed') {
      return `Winner: ${data.winner}`; // Assuming data.winner holds the team number, e.g., "T1", "T2"
    }
    if (data.status === 'In Progress' && data.score1 && data.score2) {
      return `${data.score1} - ${data.score2}`;
    }
    if (data.arena) {
      return `Arena: ${data.arena}`;
    }
    return data.status || 'Not Started';
  }

  // Determine border for team 1
  const team1BorderClass = data.winner === data.team1Number && data.status === 'Completed' ? 'border-3 border-green-500' : 'border-2 border-gray-300';
  // Determine border for team 2
  const team2BorderClass = data.winner === data.team2Number && data.status === 'Completed' ? 'border-3 border-green-500' : 'border-2 border-gray-300';

  return (
    // The main container border remains gray if no winner is overall
    <div className="bg-white rounded-lg shadow-lg w-25">
      {/* Team 1 */}
      <div className={`${getTeamColor()} px-2 py-0.5 ${team1BorderClass} rounded-t-lg text-center font-semibold text-sm flex items-center justify-center`}>
        <span className="text-white">{data.team1Number}</span>
      </div>

      {/* Middle section - scores, arena, or status */}
      <div className="bg-white px-1 py-0.5 text-center font-medium text-black text-xs border-y border-gray-200">
        {getMiddleContent()}
      </div>

      {/* Team 2 */}
      <div className={`${getTeamColor()} px-2 py-0.5 ${team2BorderClass} rounded-b-lg text-center font-semibold text-sm flex items-center justify-center`}>
        <span className="text-white">{data.team2Number}</span>
      </div>
    </div>
  )
}