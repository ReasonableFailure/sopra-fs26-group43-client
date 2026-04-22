"use client";

import React from "react";
import { Character } from "@/types/character";
import { Alert, Tag, Tooltip } from "antd";

interface MessageLimitIndicatorProps {
  character: Character | null;
  exchangeRate: number;
}

/**
 * Displays the player's remaining message slots and action points.
 * Per S6: players start with 15 message slots.
 * Per S15: players can spend action points to buy additional slots.
 * Per S16: players earn action points by exchanging likes on pronouncements.
 */
const MessageLimitIndicator: React.FC<MessageLimitIndicatorProps> = ({
  character,
  exchangeRate,
}) => {
  if (!character) {
    return null;
  }

  const remaining = 15 - character.messageCount;
  const points = character.actionPoints;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Messages Remaining:</span>
        <Tag color={remaining > 5 ? "green" : remaining > 0 ? "orange" : "red"}>
          {remaining} / {character.messageSlots}
        </Tag>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <span style={{ fontWeight: 600 }}>Action Points:</span>
        <Tag color={points > 0 ? "blue" : "default"}>
          {points}
        </Tag>
        <Tooltip
          title={`You need ${exchangeRate} likes on your pronouncements to earn 1 action point. Spend action points to buy additional message slots.`}
        >
          <span style={{ cursor: "help", color: "#999" }}>(?)</span>
        </Tooltip>
      </div>
      {remaining === 0 && (
        <Alert
          type="warning"
          message="No message slots remaining"
          description="You have used all your message slots. Earn action points through likes on your pronouncements, then use them to purchase additional message slots."
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};

export default MessageLimitIndicator;
