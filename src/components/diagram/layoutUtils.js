import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

/**
 * Estimate the rendered width of a text string at ~14px font size.
 */
const estimateTextWidth = (text) => {
  if (!text) return 0;
  return String(text).length * 7;
};

/**
 * Estimate the rendered width of a dataset node based on its content.
 */
const estimateNodeWidth = (dataset) => {
  const minWidth = 250;
  const padding = 70;
  const typeGap = 16;

  const headerWidth = 30 + estimateTextWidth(dataset.name);

  let maxFieldWidth = 0;
  for (const field of dataset.fields || []) {
    const expr = field.expression?.dialects?.[0]?.expression;
    const showExpr = expr && expr !== field.name;
    const rowWidth = estimateTextWidth(field.name) + (showExpr ? typeGap + estimateTextWidth(expr) : 0);
    if (rowWidth > maxFieldWidth) maxFieldWidth = rowWidth;
  }

  return Math.max(minWidth, headerWidth + padding, maxFieldWidth + padding);
};

/**
 * Estimate the rendered height of a dataset node.
 */
const estimateNodeHeight = (dataset) => {
  const headerHeight = 44;
  const fieldRowHeight = 40;
  const emptyStateHeight = 40;
  const bottomPadding = 8;

  const fields = dataset.fields || [];
  if (fields.length === 0) return headerHeight + emptyStateHeight + bottomPadding;

  return headerHeight + fields.length * fieldRowHeight + bottomPadding;
};

// Constants matching DatasetNode rendering
const PORT_HEADER_HEIGHT = 40;
const PORT_FIELD_ROW_HEIGHT = 42;

/**
 * Layout nodes using the ELK layout algorithm with port-aware routing.
 * @param {Array} datasets - Array of dataset objects to layout
 * @param {Array} relationships - Array of relationship objects
 * @returns {Promise<Array>} - Datasets with calculated positions
 */
export const getLayoutedElements = async (datasets, relationships = []) => {
  if (!datasets.length) return datasets;

  // Build ELK nodes with ports for each field
  const elkNodes = datasets.map((dataset, index) => {
    const nodeId = `dataset-${index}`;
    const nodeWidth = estimateNodeWidth(dataset);
    const nodeHeight = estimateNodeHeight(dataset);
    const fields = dataset.fields || [];

    const ports = [];
    fields.forEach((field, fieldIdx) => {
      const portY = PORT_HEADER_HEIGHT + fieldIdx * PORT_FIELD_ROW_HEIGHT + PORT_FIELD_ROW_HEIGHT / 2;

      // Source port (left side in DatasetNode)
      ports.push({
        id: `${nodeId}-field-${fieldIdx}-source`,
        layoutOptions: {
          'port.side': 'EAST',
          'port.index': String(fieldIdx),
        },
        x: nodeWidth,
        y: portY,
        width: 1,
        height: 1,
      });

      // Target port (right side in DatasetNode)
      ports.push({
        id: `${nodeId}-field-${fieldIdx}-target`,
        layoutOptions: {
          'port.side': 'WEST',
          'port.index': String(fieldIdx),
        },
        x: 0,
        y: portY,
        width: 1,
        height: 1,
      });
    });

    return {
      id: nodeId,
      width: nodeWidth,
      height: nodeHeight,
      ports,
      layoutOptions: {
        'portConstraints': 'FIXED_POS',
      },
    };
  });

  // Build ELK edges from relationships
  const elkEdges = [];
  relationships.forEach((rel) => {
    const sourceIndex = datasets.findIndex(d => d?.name === rel.from);
    const targetIndex = datasets.findIndex(d => d?.name === rel.to);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const sourceDataset = datasets[sourceIndex];
    const targetDataset = datasets[targetIndex];
    const fromCols = rel.from_columns || [];
    const toCols = rel.to_columns || [];
    const pairCount = Math.min(fromCols.length, toCols.length);

    if (pairCount > 0) {
      for (let i = 0; i < pairCount; i++) {
        const sourceFieldIndex = sourceDataset.fields?.findIndex(f => f?.name === fromCols[i]);
        const targetFieldIndex = targetDataset.fields?.findIndex(f => f?.name === toCols[i]);

        if (sourceFieldIndex !== -1 && targetFieldIndex !== -1) {
          elkEdges.push({
            id: `edge-${sourceIndex}-${sourceFieldIndex}-${targetIndex}-${targetFieldIndex}`,
            sources: [`dataset-${sourceIndex}-field-${sourceFieldIndex}-source`],
            targets: [`dataset-${targetIndex}-field-${targetFieldIndex}-target`],
          });
        }
      }
    } else {
      // Dataset-level edge (no column pairs)
      elkEdges.push({
        id: `edge-rel-${sourceIndex}-${targetIndex}`,
        sources: [`dataset-${sourceIndex}`],
        targets: [`dataset-${targetIndex}`],
      });
    }
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '150',
      'elk.spacing.edgeNode': '30',
      'elk.spacing.edgeEdge': '20',
      'elk.layered.spacing.edgeNodeBetweenLayers': '30',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layoutedGraph = await elk.layout(graph);

  return datasets.map((dataset, index) => {
    const elkNode = layoutedGraph.children.find(n => n.id === `dataset-${index}`);
    return {
      ...dataset,
      position: elkNode
        ? { x: elkNode.x, y: elkNode.y }
        : { x: 0, y: 0 },
    };
  });
};

/**
 * Calculate grid-based position for a dataset node (fallback)
 */
export const getGridPosition = (index) => {
  const cols = 3;
  const nodeWidth = 300;
  const nodeHeight = 400;
  const startX = 50;
  const startY = 50;

  return {
    x: startX + (index % cols) * nodeWidth,
    y: startY + Math.floor(index / cols) * nodeHeight,
  };
};
