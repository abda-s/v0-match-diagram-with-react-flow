interface GridMatchData {
  team1: string
  team2: string
  arena?: string
  isBye: boolean
}

export function GridMatchNode({ data }: { data: GridMatchData }) {
  if (data.isBye) {
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg w-20">
        {/* Team 1 - Red background */}
        <div className="bg-red-500 text-white px-2 py-0.5 rounded-t-lg text-center font-semibold text-sm">
          {data.team1}
        </div>
        <div className="bg-white px-1 py-0.5 text-center font-medium text-white text-xs border-y border-gray-200">
          aaa
        </div>
        {/* Team 2 - Gray background for BYE */}
        <div className="bg-gray-500 text-white px-2 py-0.5 rounded-b-lg text-center font-semibold text-sm">
          {data.team2}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg w-20">
      {/* Team 1 - Red background */}
      <div className="bg-red-500 text-white px-2 py-0.5 rounded-t-lg text-center font-semibold text-sm">
        {data.team1}
      </div>

      {/* Arena - White background (only if not bye) */}
      {data.arena && (
        <div className="bg-white px-1 py-0.5 text-center font-medium text-black text-xs border-y border-gray-200">
          {data.arena}
        </div>
      )}

      {/* Team 2 - Red background */}
      <div className="bg-red-500 text-white px-2 py-0.5 rounded-b-lg text-center font-semibold text-sm">
        {data.team2}
      </div>
    </div>
  )
}
