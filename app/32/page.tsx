"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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

// Function to check if all matches in a round are completed
const isRoundCompleted = (matches, num) => {
  return matches.filter(match => match.status === 'Completed').length === num;
}

// Function to get qualified teams from a round
const getQualifiedTeams = (matches) => {
  return matches
    .filter(match => match.status === 'Completed' && match.winner)
    .map((match, index) => ({
      id: `qualified-${index}`,
      teamName: match.winnerDisplay || match.winner
    }));
}

// Custom ordering for different rounds
const getMatchOrder = (roundIndex, totalMatches) => {
  if (roundIndex === 0) { // Round 32

    const rightOrder = [14,6,2,10,4,12,8,0];
    const leftOrder = [15,7,3,11,5,13,9,1]; 
    return [...rightOrder, ...leftOrder];
  } else if (roundIndex === 1) { // Round 16

    const rightOrder = [6,2,4,0];
    const leftOrder = [7,3,5,1];
    return [...rightOrder, ...leftOrder];
  } else if (roundIndex === 2) { // Round 8

    const rightOrder = [2,0];
    const leftOrder = [3,1];
    return [...rightOrder, ...leftOrder];
  }
  
  // Default ordering for other rounds
  return Array(totalMatches).fill(null).map((_, i) => i);
}

// Tournament structure - defines the layout of the bracket
const tournamentStructure = {
  rounds: [
    {
      id: "round-1",
      name: "Round 1",
      matches: Array(16).fill(null).map((_, i) => ({
        id: `match-${i}`,
        arena: "",
        team1Number: "TBP",
        team1Name: "TBP",
        team1Display: "TBP",
        team2Number: "TBP",
        team2Name: "TBP",
        team2Display: "TBP",
        score1: "",
        score2: "",
        status: "Not Started",
        winner: "",
        winnerDisplay: "",
        isBye: false
      })),
    },
    {
      id: "round-2",
      name: "Round 2",
      matches: Array(8).fill(null).map((_, i) => ({
        id: `match-${i+16}`,
        arena: "",
        team1Number: "TBP",
        team1Name: "TBP",
        team1Display: "TBP",
        team2Number: "TBP",
        team2Name: "TBP",
        team2Display: "TBP",
        score1: "",
        score2: "",
        status: "Not Started",
        winner: "",
        winnerDisplay: "",
        isBye: false
      })),
    },
    {
      id: "round-3",
      name: "Quarter Finals",
      matches: Array(4).fill(null).map((_, i) => ({
        id: `match-${i+24}`,
        arena: "",
        team1Number: "TBP",
        team1Name: "TBP",
        team1Display: "TBP",
        team2Number: "TBP",
        team2Name: "TBP",
        team2Display: "TBP",
        score1: "",
        score2: "",
        status: "Not Started",
        winner: "",
        winnerDisplay: "",
        isBye: false
      })),
    },
    {
      id: "qualified",
      name: "Qualified Teams",
      qualifiedTeams: Array(4).fill(null).map((_, i) => ({
        id: `qualified-${i}`,
        teamName: "TBP",
      })),
    },
  ],
}

function TournamentBracket() {
  const [round32, setRound32] = useState([]);
  const [round16, setRound16] = useState([]);
  const [round8, setRound8] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingRound, setFetchingRound] = useState('32'); // Which round we're currently fetching

  // Fetch data for a specific round
  const fetchRoundData = useCallback(async (round) => {
    try {
      let response;
      switch (round) {
        case '32':
          response = await fetch('/api/scoring-32');
          break;
        case '16':
          response = await fetch('/api/scoring-16');
          break;
        case '8':
          response = await fetch('/api/scoring-8');
          break;
        default:
          return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch round ${round} data`);
      }

      const data = await response.json();
      
      // Update the appropriate round state
      switch (round) {
        case '32':
          setRound32(data);
          break;
        case '16':
          setRound16(data);
          break;
        case '8':
          setRound8(data);
          break;
      }
    } catch (err) {
      console.error(`Error fetching round ${round} data:`, err);
      setError(err.message);
    }
  }, []);

  // Initial data fetch and round progression logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Start with round 32
        await fetchRoundData('32');
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchRoundData]);

  // Effect to handle round progression
  useEffect(() => {
    const checkRoundCompletion = async () => {
      // Check if round 32 is completed and we haven't fetched round 16 yet
      if (round32.length > 0 && isRoundCompleted(round32,16) && round16.length === 0) {
        setFetchingRound('16');
        await fetchRoundData('16');
      }
      
      // Check if round 16 is completed and we haven't fetched round 8 yet
      if (round16.length > 0 && isRoundCompleted(round16,8) && round8.length === 0) {
        setFetchingRound('8');
        await fetchRoundData('8');
      }
    };

    checkRoundCompletion();
  }, [round32, round16, round8, fetchRoundData]);

  // Auto-refresh the current fetching round
  useEffect(() => {
    if (fetchingRound) {
      const intervalId = setInterval(() => {
        fetchRoundData(fetchingRound);
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchingRound, fetchRoundData]);

  // Generate nodes and edges from tournament structure
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const roundSpacing = 250;
    const baseMatchSpacing = 150;
    const centerX = 1200;
    const centerY = 500;

    const nodePositions: { [key: string]: { x: number; y: number } } = {};

    // Create a merged data structure that combines the static layout with fetched data
    const mergedData = {
      rounds: tournamentStructure.rounds.map((round, roundIndex) => {
        if (round.qualifiedTeams) {
          // Handle qualified teams
          let qualifiedTeams = round.qualifiedTeams;
          
          // If we have data for round 8 and it's completed, use the actual qualified teams
          if (round8.length > 0 && isRoundCompleted(round8,4)) {
            qualifiedTeams = getQualifiedTeams(round8);
          }
          
          return { ...round, qualifiedTeams };
        }
        
        // Handle regular matches
        let matches = round.matches;
        
        // Replace with fetched data if available and reorder according to custom logic
        if (roundIndex === 0) {
          // Always use the structure, but update with fetched data if available
          matches = tournamentStructure.rounds[0].matches.map((match, index) => {
            if (round32.length > 0 && index < round32.length) {
              const fetchedMatch = round32[index];
              return {
                ...match,
                arena: fetchedMatch.arena || "",
                team1Number: fetchedMatch.team1Number || "TBP",
                team1Name: fetchedMatch.team1Name || "TBP",
                team1Display: fetchedMatch.team1Display || "TBP",
                team2Number: fetchedMatch.team2Number || "TBP",
                team2Name: fetchedMatch.team2Name || "TBP",
                team2Display: fetchedMatch.team2Display || "TBP",
                score1: fetchedMatch.score1 || "",
                score2: fetchedMatch.score2 || "",
                status: fetchedMatch.status || "Not Started",
                winner: fetchedMatch.winner || "",
                winnerDisplay: fetchedMatch.winnerDisplay || "",
                isBye: fetchedMatch.isBye || false
              };
            }
            return match;
          });
          
          // Reorder matches according to custom ordering
          const matchOrder = getMatchOrder(roundIndex, matches.length);
          const reorderedMatches = matchOrder.map(originalIndex => matches[originalIndex]);
          matches = reorderedMatches;
          
        } else if (roundIndex === 1) {
          // Always use the structure, but update with fetched data if available
          matches = tournamentStructure.rounds[1].matches.map((match, index) => {
            if (round16.length > 0 && index < round16.length) {
              const fetchedMatch = round16[index];
              return {
                ...match,
                arena: fetchedMatch.arena || "",
                team1Number: fetchedMatch.team1Number || "TBP",
                team1Name: fetchedMatch.team1Name || "TBP",
                team1Display: fetchedMatch.team1Display || "TBP",
                team2Number: fetchedMatch.team2Number || "TBP",
                team2Name: fetchedMatch.team2Name || "TBP",
                team2Display: fetchedMatch.team2Display || "TBP",
                score1: fetchedMatch.score1 || "",
                score2: fetchedMatch.score2 || "",
                status: fetchedMatch.status || "Not Started",
                winner: fetchedMatch.winner || "",
                winnerDisplay: fetchedMatch.winnerDisplay || "",
                isBye: fetchedMatch.isBye || false
              };
            }
            return match;
          });
          
          // Reorder matches according to custom ordering
          const matchOrder = getMatchOrder(roundIndex, matches.length);
          const reorderedMatches = matchOrder.map(originalIndex => matches[originalIndex]);
          matches = reorderedMatches;
          
        } else if (roundIndex === 2) {
          // Always use the structure, but update with fetched data if available
          matches = tournamentStructure.rounds[2].matches.map((match, index) => {
            if (round8.length > 0 && index < round8.length) {
              const fetchedMatch = round8[index];
              return {
                ...match,
                arena: fetchedMatch.arena || "",
                team1Number: fetchedMatch.team1Number || "TBP",
                team1Name: fetchedMatch.team1Name || "TBP",
                team1Display: fetchedMatch.team1Display || "TBP",
                team2Number: fetchedMatch.team2Number || "TBP",
                team2Name: fetchedMatch.team2Name || "TBP",
                team2Display: fetchedMatch.team2Display || "TBP",
                score1: fetchedMatch.score1 || "",
                score2: fetchedMatch.score2 || "",
                status: fetchedMatch.status || "Not Started",
                winner: fetchedMatch.winner || "",
                winnerDisplay: fetchedMatch.winnerDisplay || "",
                isBye: fetchedMatch.isBye || false
              };
            }
            return match;
          });
          
          // Reorder matches according to custom ordering
          const matchOrder = getMatchOrder(roundIndex, matches.length);
          const reorderedMatches = matchOrder.map(originalIndex => matches[originalIndex]);
          matches = reorderedMatches;
        }
        
        return { ...round, matches };
      })
    };

    mergedData.rounds.forEach((round, roundIndex) => {
      if (round.qualifiedTeams) {
        // Display qualified teams
        round.qualifiedTeams.forEach((team, teamIndex) => {
          const nodeX = centerX;
          const nodeY = centerY - 150 + teamIndex * 100;

          nodePositions[team.id] = { x: nodeX, y: nodeY };

          nodes.push({
            id: team.id,
            type: "qualified",
            position: { x: nodeX, y: nodeY },
            data: {
              teamName: team.teamName || "TBP",
            },
          });

          // Create edges from previous round to qualified teams
          if (roundIndex > 0) {
            const prevRound = mergedData.rounds[roundIndex - 1];
            if (prevRound.matches && teamIndex < prevRound.matches.length) {
              const sourceMatch = prevRound.matches[teamIndex];
              const isSourceOnRightSide = teamIndex >= prevRound.matches.length / 2;

              edges.push({
                id: `edge-${sourceMatch.id}-${team.id}`,
                source: sourceMatch.id,
                target: team.id,
                sourceHandle: isSourceOnRightSide ? "left" : "right",
                targetHandle: "left",
                type: "smoothstep",
                style: { stroke: "#22c55e", strokeWidth: 3 },
              });
            }
          }
        });
        return; // Skip the rest of the match processing for this round
      }

      const totalMatches = round.matches.length;

      round.matches.forEach((match, matchIndex) => {
        let nodeX: number;
        let nodeY: number;

        if (roundIndex === 0) {
          // First round: split matches between left and right sides
          const isRightSide = matchIndex < totalMatches / 2;
          nodeX = isRightSide ? centerX + roundSpacing * 4 : centerX - roundSpacing * 4;

          // Position matches vertically with proper spacing
          const sideMatchIndex = isRightSide ? matchIndex : matchIndex - totalMatches / 2;
          const sideMatches = totalMatches / 2;
          // Center the matches vertically
          const totalHeight = (sideMatches - 1) * baseMatchSpacing;
          const startY = centerY - totalHeight / 2;
          nodeY = startY + sideMatchIndex * baseMatchSpacing;
        } else {
          // For subsequent rounds, we need to map back to the original indices for positioning
          const originalMatchOrder = getMatchOrder(roundIndex - 1, mergedData.rounds[roundIndex - 1].matches.length);
          const parentMatch1OriginalIndex = matchIndex * 2;
          const parentMatch2OriginalIndex = matchIndex * 2 + 1;
          
          // Find where these original indices appear in the reordered list
          const parentMatch1DisplayIndex = originalMatchOrder.indexOf(parentMatch1OriginalIndex);
          const parentMatch2DisplayIndex = originalMatchOrder.indexOf(parentMatch2OriginalIndex);
          
          const prevRound = mergedData.rounds[roundIndex - 1];

          if (parentMatch1DisplayIndex >= 0 && parentMatch2DisplayIndex >= 0 && 
              parentMatch1DisplayIndex < prevRound.matches.length && 
              parentMatch2DisplayIndex < prevRound.matches.length) {
            const parent1Id = prevRound.matches[parentMatch1DisplayIndex].id;
            const parent2Id = prevRound.matches[parentMatch2DisplayIndex].id;
            const parent1Pos = nodePositions[parent1Id];
            const parent2Pos = nodePositions[parent2Id];

            if (parent1Pos && parent2Pos) {
              // Average Y position of parent matches
              nodeY = (parent1Pos.y + parent2Pos.y) / 2;
            } else {
              // Fallback to center if parents not found
              nodeY = centerY;
            }
          } else {
            nodeY = centerY;
          }

          if (roundIndex === mergedData.rounds.length - 1) {
            // Final match at center
            nodeX = centerX;
          } else {
            // Calculate distance from center based on round
            const roundsFromFinal = mergedData.rounds.length - 1 - roundIndex;
            const totalMatchesInRound = round.matches.length;
            const isRightSide = matchIndex < Math.ceil(totalMatchesInRound / 2);

            if (isRightSide) {
              nodeX = centerX + roundSpacing * roundsFromFinal;
            } else {
              nodeX = centerX - roundSpacing * roundsFromFinal;
            }
          }
        }

        nodePositions[match.id] = { x: nodeX, y: nodeY };

        nodes.push({
          id: match.id,
          type: "match",
          position: { x: nodeX, y: nodeY },
          data: {
            arena: match.arena,
            team1Number: match.team1Number,
            team1Name: match.team1Name,
            team1Display: match.team1Display,
            team2Number: match.team2Number,
            team2Name: match.team2Name,
            team2Display: match.team2Display,
            score1: match.score1,
            score2: match.score2,
            status: match.status,
            winner: match.winner,
            winnerDisplay: match.winnerDisplay,
            isBye: match.isBye
          },
        });

        // Create edges to next round
        if (
          roundIndex < mergedData.rounds.length - 1 &&
          !(mergedData.rounds[roundIndex + 1].qualifiedTeams && matchIndex < mergedData.rounds[roundIndex + 1].qualifiedTeams.length)
        ) {
          const nextRound = mergedData.rounds[roundIndex + 1];

          // Check if next round has qualified teams instead of matches
          if (nextRound.qualifiedTeams) {
            // Connect to qualified teams
            const qualifiedTeamIndex = matchIndex;
            if (qualifiedTeamIndex < nextRound.qualifiedTeams.length) {
              const qualifiedTeam = nextRound.qualifiedTeams[qualifiedTeamIndex];

              const isCurrentMatchOnRightSide = matchIndex >= round.matches.length / 2;

              edges.push({
                id: `edge-${match.id}-${qualifiedTeam.id}`,
                source: match.id,
                target: qualifiedTeam.id,
                sourceHandle: isCurrentMatchOnRightSide ? "left" : "right",
                targetHandle: "left",
                type: "smoothstep",
                style: { stroke: "#22c55e", strokeWidth: 3 },
              });
            }
          } else if (nextRound.matches) {
            // Connect to next round matches
            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
            const nextRoundMatch = nextRound.matches[nextRoundMatchIndex];

            if (nextRoundMatch) {
              const isRightSide =
                roundIndex === 0
                  ? matchIndex < 8
                  : roundIndex === 1
                    ? matchIndex < 4
                    : roundIndex === 2
                      ? matchIndex < 2
                      : matchIndex === 0;

              edges.push({
                id: `edge-${match.id}-${nextRoundMatch.id}`,
                source: match.id,
                target: nextRoundMatch.id,
                sourceHandle: isRightSide ? "left" : "right",
                targetHandle: isRightSide ? "right" : "left",
                type: "smoothstep",
                style: { stroke: "#ffffff", strokeWidth: 2 },
              });
            }
          }
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [round32, round16, round8]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Update nodes when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Always show the bracket, even if loading or there's an error
  if (loading) {
    return (
      <div className="w-full h-screen bg-black">
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg">
          <h2 className="text-lg font-bold">Tournament Progress</h2>
          <p className="text-sm opacity-75">Loading tournament data...</p>
        </div>
        
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
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
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black">
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg">
          <h2 className="text-lg font-bold">Tournament Progress</h2>
          <p className="text-sm opacity-75">Error: {error}</p>
        </div>
        
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
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
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg">
        <h2 className="text-lg font-bold">Tournament Progress</h2>
        <p className="text-sm opacity-75">
          {fetchingRound === '32' && `Round of 32: ${round32.filter(m => m.status === 'Completed').length}/${round32.length || 16} matches completed`}
          {fetchingRound === '16' && `Round of 16: ${round16.filter(m => m.status === 'Completed').length}/${round16.length || 8} matches completed`}
          {fetchingRound === '8' && `Quarter Finals: ${round8.filter(m => m.status === 'Completed').length}/${round8.length || 4} matches completed`}
          {!fetchingRound && round8.length > 0 && isRoundCompleted(round8,4) && 'Tournament Completed'}
        </p>
      </div>
      
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
  );
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <TournamentBracket />
    </ReactFlowProvider>
  );
}