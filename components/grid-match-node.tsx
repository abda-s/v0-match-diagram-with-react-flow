import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface GridMatchData {
  team1Number: string
  team2Number: string
  team1Display: string // Added to fix a missing property in the original logic for team display
  team2Display: string // Added to fix a missing property in the original logic for team display
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
      <div className="bg-white rounded-lg shadow-lg min-w-[180px]">
        {/* Team 1 - Red background (as was in original BYE logic) */}
        <div className="border-gray-300 border-2 bg-primary text-white px-2 py-0.5 rounded-t-lg text-center font-semibold text-sm">
          {data.team1Display}
        </div>
        <div className="bg-white px-1 py-0.5 text-center font-medium text-white text-xs border-x-2 border-gray-300">
          BYE
        </div>
        {/* Team 2 - Gray background for BYE */}
        <div className="border-gray-300 border-2 bg-gray-500 text-white px-2 py-0.5 rounded-b-lg text-center font-semibold text-sm">
          {data.team2Number}
        </div>
      </div>
    )
  }
  
  // Logic to determine the middle content (scores, status, arena)
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
    <div className="bg-white rounded-lg shadow-lg min-w-[180px]">
      {/* Team 1 - Highlight winner with red background */}
      <div className={`${team1BgClass} px-2 py-0.5 ${standardBorderClass} rounded-t-lg text-center font-bold text-sm flex items-center justify-center`}>
        <span className="text-white">{data.team1Display}</span>
      </div>

      {/* Middle section - scores, arena, or status */}
      <div className="bg-gray-100 px-1 py-0.5 text-center font-medium text-black text-xs border-x-2 border-gray-300 ">
        {getMiddleContent()}
      </div>

      {/* Team 2 - Highlight winner with red background */}
      <div className={`${team2BgClass} px-2 py-0.5 ${standardBorderClass} rounded-b-lg text-center font-semibold text-sm flex items-center justify-center`}>
        <span className="text-white">{data.team2Display}</span>
      </div>
    </div>
  )
}