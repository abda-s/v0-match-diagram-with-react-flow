"use client"

import { ReactFlow, type Node, Background, Controls } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { GridMatchNode } from "../../components/grid-match-node"

const nodeTypes = {
  gridMatch: GridMatchNode,
}

const LAYOUT_CONFIG = {
  COLUMNS_PER_SECTION: 5,
  TOTAL_SECTIONS: 2,
  COLUMN_WIDTH: 120,
  ROW_HEIGHT: 100,
  SECTION_GAP: 720,
}

const tournamentData = {
  matches: [
    { id: "match-1", team1: "001", team2: "002", arena: "Arena 1" },
    { id: "match-2", team1: "003", team2: "BYE", arena: "" },
    { id: "match-3", team1: "004", team2: "005", arena: "Arena 2" },
    { id: "match-4", team1: "006", team2: "BYE", arena: "" },
    { id: "match-5", team1: "007", team2: "008", arena: "Arena 3" },
    { id: "match-6", team1: "009", team2: "010", arena: "Arena 4" },
    { id: "match-7", team1: "011", team2: "BYE", arena: "" },
    { id: "match-8", team1: "012", team2: "013", arena: "Arena 5" },
    { id: "match-9", team1: "014", team2: "015", arena: "Arena 6" },
    { id: "match-10", team1: "016", team2: "BYE", arena: "" },
    { id: "match-11", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-12", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-13", team1: "021", team2: "BYE", arena: "" },
    { id: "match-14", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-15", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-16", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-17", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-18", team1: "026", team2: "BYE", arena: "" },
    { id: "match-19", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-20", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-21", team1: "021", team2: "BYE", arena: "" },
    { id: "match-22", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-23", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-24", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-25", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-26", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-27", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-28", team1: "021", team2: "BYE", arena: "" },
    { id: "match-29", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-30", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-31", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-32", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-33", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-34", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-35", team1: "021", team2: "BYE", arena: "" },
    { id: "match-36", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-37", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-38", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-39", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-40", team1: "021", team2: "BYE", arena: "" },
    { id: "match-41", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-42", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-43", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-58", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-44", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-45", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-46", team1: "021", team2: "BYE", arena: "" },
    { id: "match-47", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-48", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-49", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-50", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-51", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-52", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-53", team1: "021", team2: "BYE", arena: "" },
    { id: "match-54", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-55", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-56", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-57", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-59", team1: "017", team2: "018", arena: "Arena 1" },
    { id: "match-60", team1: "019", team2: "020", arena: "Arena 2" },
    { id: "match-61", team1: "021", team2: "BYE", arena: "" },
    { id: "match-62", team1: "022", team2: "023", arena: "Arena 3" },
    { id: "match-63", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-64", team1: "024", team2: "025", arena: "Arena 4" },
    { id: "match-65", team1: "024", team2: "025", arena: "Arena 4" },
    // Add more matches as needed - this is just a sample
  ],
}

function generateTournamentNodes() {
  const validMatches = tournamentData.matches.filter((match) => !(match.team1 === "BYE" && match.team2 === "BYE"))

  const nodes: Node[] = []

  validMatches.forEach((match, index) => {
    const totalColumns = LAYOUT_CONFIG.COLUMNS_PER_SECTION * LAYOUT_CONFIG.TOTAL_SECTIONS
    const row = Math.floor(index / totalColumns)
    const col = index % totalColumns

    const isRightSection = col >= LAYOUT_CONFIG.COLUMNS_PER_SECTION
    const adjustedCol = isRightSection ? col - LAYOUT_CONFIG.COLUMNS_PER_SECTION : col
    const xPosition = adjustedCol * LAYOUT_CONFIG.COLUMN_WIDTH + (isRightSection ? LAYOUT_CONFIG.SECTION_GAP : 0)

    nodes.push({
      id: match.id,
      type: "gridMatch",
      position: {
        x: xPosition,
        y: row * LAYOUT_CONFIG.ROW_HEIGHT + 50,
      },
      data: {
        team1: match.team1,
        team2: match.team2,
        arena: match.arena,
        isBye: match.team1 === "BYE" || match.team2 === "BYE",
      },
    })
  })



  return nodes
}

export default function Tournament128() {
  const nodes: Node[] = generateTournamentNodes()

  return (
    <div className="h-screen bg-black">
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
        maxZoom={2}
      >
        <Background color="#ffffff" gap={20} size={1} />
        <Controls
          position="bottom-left"
          style={{
            button: {
              backgroundColor: "#374151",
              color: "white",
              border: "1px solid #6b7280",
            },
          }}
        />
      </ReactFlow>
    </div>
  )
}
