import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Character } from "@/types/character";

/**
 * Hook that manages message limiting logic.
 * Checks if a character has enough action points to send a message
 * and handles the message cost deduction on the frontend side.
 */
export function useMessageLimiting() {
  const apiService = useApi();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check whether the character has enough action points to send a message.
   * Each message costs 1 action point.
   */
  const canSendMessage = useCallback((character: Character | null): boolean => {
    if (!character) return false;
    if (!character.isAlive) return false;
    if (character.actionPoints < 1) return false;
    return true;
  }, []);

  /**
   * Get a user-friendly reason why the message cannot be sent.
   */
  const getBlockReason = useCallback(
    (character: Character | null): string | null => {
      if (!character) return "No character selected.";
      if (!character.isAlive)
        return "Your character is no longer alive and cannot send messages.";
      if (character.actionPoints < 1)
        return "You do not have enough action points to send a message. Earn more likes on your pronouncements to gain action points.";
      return null;
    },
    []
  );

  /**
   * Attempt to send a message through the API.
   * Validates action points before making the API call.
   * Returns true if message was sent successfully, false otherwise.
   */
  const sendMessage = useCallback(
    async (
      character: Character,
      recipientId: number,
      bodyText: string
    ): Promise<boolean> => {
      setError(null);

      // Frontend validation: check action points
      if (!canSendMessage(character)) {
        const reason = getBlockReason(character);
        setError(reason || "Cannot send message.");
        return false;
      }

      // Validate message content
      if (!bodyText || bodyText.trim().length === 0) {
        setError("Message content cannot be empty.");
        return false;
      }

      setIsSending(true);
      try {
        await apiService.post("/messages", {
          senderId: character.id,
          recipientId: recipientId,
          bodyText: bodyText.trim(),
        });
        return true;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while sending the message.");
        }
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [apiService, canSendMessage, getBlockReason]
  );

  /**
   * Calculate how many messages the character can still send.
   */
  const remainingMessages = useCallback(
    (character: Character | null): number => {
      if (!character) return 0;
      return Math.max(0, character.actionPoints);
    },
    []
  );

  /**
   * Calculate how many likes are needed to earn the next action point.
   * Based on the scenario's exchange rate.
   */
  const likesForNextPoint = useCallback(
    (currentLikes: number, exchangeRate: number): number => {
      if (exchangeRate <= 0) return 0;
      const pointsEarned = Math.floor(currentLikes / exchangeRate);
      const likesUsed = pointsEarned * exchangeRate;
      return exchangeRate - (currentLikes - likesUsed);
    },
    []
  );

  return {
    canSendMessage,
    getBlockReason,
    sendMessage,
    remainingMessages,
    likesForNextPoint,
    isSending,
    error,
    clearError: () => setError(null),
  };
}
