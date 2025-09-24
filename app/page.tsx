"use client"

import { useCallback, useMemo } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { MatchNode } from "@/components/match-node"
import { QualifiedTeamNode } from "@/components/qualified-team-node"

const nodeTypes = {
  match: MatchNode,
  qualified: QualifiedTeamNode,
}

// Tournament data structure - 32 teams organized in rounds
const tournamentData = {
  rounds: [
    {
      id: "round-1",
      name: "Round 1",
      matches: [
        { id: "match-1", team1: "Team C", team2: "Team B", arena: "Arena 1" },
        { id: "match-2", team1: "Team C", team2: "Team D", arena: "Arena 2" },
        { id: "match-3", team1: "Team E", team2: "Team F", arena: "Arena 3" },
        { id: "match-4", team1: "Team G", team2: "Team H", arena: "Arena 4" },
        { id: "match-5", team1: "Team I", team2: "Team J", arena: "Arena 5" },
        { id: "match-6", team1: "Team K", team2: "Team L", arena: "Arena 6" },
        { id: "match-7", team1: "Team M", team2: "Team N", arena: "Arena 7" },
        { id: "match-8", team1: "Team O", team2: "Team P", arena: "Arena 8" },
        { id: "match-9", team1: "Team Q", team2: "Team R", arena: "Arena 9" },
        { id: "match-10", team1: "Team S", team2: "Team T", arena: "Arena 10" },
        { id: "match-11", team1: "Team U", team2: "Team V", arena: "Arena 11" },
        { id: "match-12", team1: "Team W", team2: "Team X", arena: "Arena 12" },
        { id: "match-13", team1: "Team Y", team2: "Team Z", arena: "Arena 13" },
        { id: "match-14", team1: "Team AA", team2: "Team BB", arena: "Arena 14" },
        { id: "match-15", team1: "Team CC", team2: "Team DD", arena: "Arena 15" },
        { id: "match-16", team1: "Team EE", team2: "Team FF", arena: "Arena 16" },
      ],
    },
    {
      id: "round-2",
      name: "Round 2",
      matches: [
        { id: "match-17", team1: "Winner 1", team2: "Winner 2", arena: "Arena 17" },
        { id: "match-18", team1: "Winner 3", team2: "Winner 4", arena: "Arena 18" },
        { id: "match-19", team1: "Winner 5", team2: "Winner 6", arena: "Arena 19" },
        { id: "match-20", team1: "Winner 7", team2: "Winner 8", arena: "Arena 20" },
        { id: "match-21", team1: "Winner 9", team2: "Winner 10", arena: "Arena 21" },
        { id: "match-22", team1: "Winner 11", team2: "Winner 12", arena: "Arena 22" },
        { id: "match-23", team1: "Winner 13", team2: "Winner 14", arena: "Arena 23" },
        { id: "match-24", team1: "Winner 15", team2: "Winner 16", arena: "Arena 24" },
      ],
    },
    {
      id: "round-3",
      name: "Quarter Finals",
      matches: [
        { id: "match-25", team1: "Winner 17", team2: "Winner 18", arena: "Arena 25" },
        { id: "match-26", team1: "Winner 19", team2: "Winner 20", arena: "Arena 26" },
        { id: "match-27", team1: "Winner 21", team2: "Winner 22", arena: "Arena 27" },
        { id: "match-28", team1: "Winner 23", team2: "Winner 24", arena: "Arena 28" },
      ],
    },
    {
      id: "qualified",
      name: "Qualified Teams",
      qualifiedTeams: [
        { id: "qualified-1", teamName: "Team Alpha" },
        { id: "qualified-2", teamName: "Team Beta" },
        { id: "qualified-3", teamName: "Team Gamma" },
        { id: "qualified-4", teamName: "Team Delta" },
      ],
    },
  ],
}

function TournamentBracket() {
  // Generate nodes and edges from tournament data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const roundSpacing = 250 // Consistent spacing between all rounds
    const baseMatchSpacing = 150 // Vertical spacing between matches
    const centerX = 1200
    const centerY = 500

    const nodePositions: { [key: string]: { x: number; y: number } } = {}

    tournamentData.rounds.forEach((round, roundIndex) => {
      if (round.qualifiedTeams) {
        // Display qualified teams
        round.qualifiedTeams.forEach((team, teamIndex) => {
          const nodeX = centerX
          const nodeY = centerY - 150 + teamIndex * 100 // Vertical spacing for qualified teams

          nodePositions[team.id] = { x: nodeX, y: nodeY }

          nodes.push({
            id: team.id,
            type: "qualified",
            position: { x: nodeX, y: nodeY },
            data: {
              teamName: team.teamName,
            },
          })

          // Create edges from previous round to qualified teams
          if (roundIndex > 0) {
            const prevRound = tournamentData.rounds[roundIndex - 1]
            if (prevRound.matches && teamIndex < prevRound.matches.length) {
              const sourceMatch = prevRound.matches[teamIndex]
              const isSourceOnRightSide = teamIndex >= prevRound.matches.length / 2

              edges.push({
                id: `edge-${sourceMatch.id}-${team.id}`,
                source: sourceMatch.id,
                target: team.id,
                sourceHandle: isSourceOnRightSide ? "left" : "right",
                targetHandle: "left",
                type: "smoothstep",
                style: { stroke: "#22c55e", strokeWidth: 3 },
              })
            }
          }
        })
        return // Skip the rest of the match processing for this round
      }

      const totalMatches = round.matches.length

      round.matches.forEach((match, matchIndex) => {
        let nodeX: number
        let nodeY: number

        if (roundIndex === 0) {
          // First round: split matches between left and right sides
          const isLeftSide = matchIndex < totalMatches / 2
          nodeX = isLeftSide ? centerX - roundSpacing * 4 : centerX + roundSpacing * 4

          // Position matches vertically with proper spacing
          const sideMatchIndex = isLeftSide ? matchIndex : matchIndex - totalMatches / 2
          const sideMatches = totalMatches / 2
          // Center the matches vertically
          const totalHeight = (sideMatches - 1) * baseMatchSpacing
          const startY = centerY - totalHeight / 2
          nodeY = startY + sideMatchIndex * baseMatchSpacing
        } else {
          const parentMatch1Index = matchIndex * 2
          const parentMatch2Index = matchIndex * 2 + 1
          const prevRound = tournamentData.rounds[roundIndex - 1]

          if (parentMatch1Index < prevRound.matches.length && parentMatch2Index < prevRound.matches.length) {
            const parent1Id = prevRound.matches[parentMatch1Index].id
            const parent2Id = prevRound.matches[parentMatch2Index].id
            const parent1Pos = nodePositions[parent1Id]
            const parent2Pos = nodePositions[parent2Id]

            if (parent1Pos && parent2Pos) {
              // Average Y position of parent matches
              nodeY = (parent1Pos.y + parent2Pos.y) / 2
            } else {
              // Fallback to center if parents not found
              nodeY = centerY
            }
          } else {
            nodeY = centerY
          }

          if (roundIndex === tournamentData.rounds.length - 1) {
            // Final match at center
            nodeX = centerX
          } else {
            // Calculate distance from center based on round
            const roundsFromFinal = tournamentData.rounds.length - 1 - roundIndex
            const totalMatchesInRound = round.matches.length
            const isLeftSide = matchIndex < Math.ceil(totalMatchesInRound / 2)

            if (isLeftSide) {
              nodeX = centerX - roundSpacing * roundsFromFinal
            } else {
              nodeX = centerX + roundSpacing * roundsFromFinal
            }
          }
        }

        nodePositions[match.id] = { x: nodeX, y: nodeY }

        nodes.push({
          id: match.id,
          type: "match",
          position: { x: nodeX, y: nodeY },
          data: {
            team1: match.team1,
            team2: match.team2,
            arena: match.arena,
          },
        })

        // Create edges to next round
        if (roundIndex < tournamentData.rounds.length - 1) {
          const nextRound = tournamentData.rounds[roundIndex + 1]

          // Check if next round has qualified teams instead of matches
          if (nextRound.qualifiedTeams) {
            // Connect to qualified teams
            const qualifiedTeamIndex = matchIndex
            if (qualifiedTeamIndex < nextRound.qualifiedTeams.length) {
              const qualifiedTeam = nextRound.qualifiedTeams[qualifiedTeamIndex]

              const isCurrentMatchOnRightSide = matchIndex >= round.matches.length / 2

              edges.push({
                id: `edge-${match.id}-${qualifiedTeam.id}`,
                source: match.id,
                target: qualifiedTeam.id,
                sourceHandle: isCurrentMatchOnRightSide ? "left" : "right",
                targetHandle: "left",
                type: "smoothstep",
                style: { stroke: "#22c55e", strokeWidth: 3 },
              })
            }
          } else if (nextRound.matches) {
            // Connect to next round matches
            const nextRoundMatchIndex = Math.floor(matchIndex / 2)
            const nextRoundMatch = nextRound.matches[nextRoundMatchIndex]

            if (nextRoundMatch) {
              const isLeftSide =
                roundIndex === 0
                  ? matchIndex < 8
                  : roundIndex === 1
                    ? matchIndex < 4
                    : roundIndex === 2
                      ? matchIndex < 2
                      : matchIndex === 0

              edges.push({
                id: `edge-${match.id}-${nextRoundMatch.id}`,
                source: match.id,
                target: nextRoundMatch.id,
                sourceHandle: isLeftSide ? "right" : "left",
                targetHandle: isLeftSide ? "left" : "right",
                type: "smoothstep",
                style: { stroke: "#ffffff", strokeWidth: 2 },
              })
            }
          }
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  return (
    <div className="w-full h-screen bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <TournamentBracket />
    </ReactFlowProvider>
  )
}
