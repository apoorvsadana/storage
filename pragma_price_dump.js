const filter = {
  header: { weak: false },
  events: [
    {
      from_address:
        "0x24075870eacc761c135fcf34968d0835af410a84ffb015eda300ca332534b8b",
      keys: [
        "0x0280bb2099800026f90c334a3a23888ffe718a2920ffbbf4f44c6d3d5efb613c",
      ],
    },
  ],
};

function decodeBlock(block) {
  const { header } = block;
  return (block?.events ?? []).map((evt, idx) => decodeEvent(header, evt, idx));
}

// Transform a single event by extracting the relevant data.
function decodeEvent(header, { event, transaction, receipt }, event_idx) {
  const { meta } = transaction;

  return {
    id: `${meta.hash}-${event_idx}`,
    timestamp: header.timestamp,
    pairId: event.data[3],
    txHash: meta.hash,
    price: parseInt(event.data[4], 16),
  };
}

// Configure indexer for streaming Starknet data starting at the specified block.
export const config = {
  streamUrl: "http://127.0.0.1:7171",
  startingBlock: 1,
  network: "starknet",
  filter,
  sinkType: "postgres",
  sinkOptions: {
    tableName: "pragma",
  },
};

// Transform each batch of data using the function defined in starknet.js.
export default function transform(batch) {
  return batch.flatMap(decodeBlock);
}
