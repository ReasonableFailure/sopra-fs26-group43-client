import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Character } from "@/types/character";

/**
 * Hook that manages message limiting logic.
 *
 * Per S6: each player starts with 15 message slots.
 * Per S15: players can spend action points to buy additional slots.
 * Per S16: players earn action points by exchanging likes (n likes = 1 point).
 */
export function useMessageLimiting() {
  const apiService = useApi();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check whether the character can still send a message.
   * True if messageCount < messageSlots (starts at 15).
   */
  const canSendMessage = useCallback((character: Character | null): boolean => {
    if (!character) return false;
    if (!character.isAlive) return false;
    return character.messageCount < character.messageSlots;
  }, []);

  /**
   * How many messages the player can still send before needing to buy more.
   */
  const remainingMessages = useCallback(
    (character: Character | null): number => {
      if (!character) return 0;
      return Math.max(0, character.messageSlots - character.messageCount);
    },
    []
  );

  /**
   * Check whether the player can buy more message slots.
   * Per S15: button is greyed out until they have enough action points.
   * @param messageCost - price per additional slot, set by backroomer
   */
  const canBuySlots = useCallback(
    (character: Character | null, messageCost: number): boolean => {
      if (!character) return false;
      if (messageCost <= 0) return false;
      return character.actionPoints >= messageCost;
    },
    []
  );

  /**
   * Buy additional message slots by spending action points.
   * Calls the backend API to process the purchase.
   * @param characterId - the character buying slots
   * @param quantity - how many slots to buy
   * @param messageCost - price per slot in action points
   */
  const buyMessageSlots = useCallback(
    async (
      characterId: number,
      quantity: number,
      messageCost: number
    ): Promise<boolean> => {
      setError(null);
      try {
        await apiService.post(`/characters/${characterId}/buy-messages`, {
          quantity,
          costPerSlot: messageCost,
        });
        return true;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to purchase message slots.");
        }
        return false;
      }
    },
    [apiService]
  );

  /**
   * Send a message to another character.
   * Validates remaining slots before calling the API.
   */
  const sendMessage = useCallback(
    async (
      character: Character,
      recipientId: number,
      bodyText: string
    ): Promise<boolean> => {
      setError(null);

      if (!canSendMessage(character)) {
        setError(
          "You have used all your message slots. Buy more with action points."
        );
        return false;
      }

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
    [apiService, canSendMessage]
  );

  return {
    canSendMessage,
    remainingMessages,
    canBuySlots,
    buyMessageSlots,
    sendMessage,
    isSending,
    error,
    clearError: () => setError(null),
  };
}
