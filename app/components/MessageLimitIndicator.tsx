"use client";

import React from "react";
import { Character } from "@/types/character";
import { Alert, Tag, Tooltip } from "antd";

interface MessageLimitIndicatorProps {
  character: Character | null;
  exchangeRate: number;
}

/**
 * Displays the current action points and message sending capability
 * of the player's character. Shows warnings when action points are low.
 */
const MessageLimitIndicator: React.FC<MessageLimitIndicatorProps> = ({
  character,
  exchangeRate,
}) => {
  if (!character) {
    return null;
  }

  const points = character.actionPoints;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Action Points:</span>
        <Tag color={points > 2 ? "green" : points > 0 ? "orange" : "red"}>
          {points}
        </Tag>
        <Tooltip
          title={`You need ${exchangeRate} likes on your pronouncements to earn 1 action point. Each message costs 1 action point.`}
        >
          <span style={{ cursor: "help", color: "#999" }}>(?)</span>
        </Tooltip>
      </div>
      {points === 0 && (
        <Alert
          type="warning"
          message="No action points remaining"
          description="You cannot send messages. Post pronouncements and earn likes to gain more action points."
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};

export default MessageLimitIndicator;
