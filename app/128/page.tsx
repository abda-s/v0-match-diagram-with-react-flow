"use client"

import { useState, useEffect } from 'react'
import { ReactFlow, type Node, Background, Controls } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { GridMatchNode } from "../../components/grid-match-node"

const nodeTypes = {
  gridMatch: GridMatchNode,
}

const LAYOUT_CONFIG = {
  COLUMNS_PER_SECTION: 5,
  TOTAL_SECTIONS: 2,
  COLUMN_WIDTH: 200,
  ROW_HEIGHT: 100,
  SECTION_GAP: 5*200,
}

export default function Tournament128() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/scoring-128')
        if (!response.ok) {
          throw new Error('Failed to fetch tournament data')
        }
        const data = await response.json()
        setMatches(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      } 
    }

    fetchData()
    
    // Auto-refresh every 10 seconds
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [])

  function generateTournamentNodes() {
    const validMatches = matches.filter((match) => !(match.team1Number === "BYE" && match.team2Number === "BYE"))

    const nodes: Node[] = []

    validMatches.forEach((match, index) => {
      const totalColumns = LAYOUT_CONFIG.COLUMNS_PER_SECTION * LAYOUT_CONFIG.TOTAL_SECTIONS
      const row = Math.floor(index / totalColumns)
      const col = index % totalColumns

      const isRightSection = col >= LAYOUT_CONFIG.COLUMNS_PER_SECTION
      const adjustedCol = isRightSection ? col - LAYOUT_CONFIG.COLUMNS_PER_SECTION : col
      const xPosition = adjustedCol * LAYOUT_CONFIG.COLUMN_WIDTH + (isRightSection ? LAYOUT_CONFIG.SECTION_GAP : 0)

      nodes.push({
        id: `match-${index}`,
        type: "gridMatch",
        position: {
          x: xPosition,
          y: row * LAYOUT_CONFIG.ROW_HEIGHT + 50,
        },
        data: {
          team1Number: match.team1Number || '',
          team2Number: match.team2Number || '',
          team1Display: match.team1Display ||'',
          team2Display: match.team2Display || '',
          arena: match.arena || '',
          score1: match.score1 || '',
          score2: match.score2 || '',
          status: match.status || 'Not Started',
          winner: match.winner || '',
          winnerDisplay: match.winnerDisplay || '',
          isBye: match.isBye
        },
      })
    })

    return nodes
  }

  const nodes: Node[] = generateTournamentNodes()

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading tournament data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black">
      {/* <div className="h-full bg-[url('/BG-3.png')] bg-cover bg-center"> */}
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 50 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.5}
        maxZoom={1.5}
      >
        

        
      </ReactFlow>
      {/* </div> */}
    </div>
  )
}