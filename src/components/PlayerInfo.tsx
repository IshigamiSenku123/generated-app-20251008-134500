import React, { useMemo } from 'react';
import { User, UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/game-store';
import { Player, PlayerProfile } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
interface PlayerInfoProps {
  player: Player | null;
  selfProfile: PlayerProfile | null;
  isOpponent: boolean;
  isBlack: boolean;
  onFriendAction: () => void; // Callback to refresh self-profile
}
export function PlayerInfo({ player, selfProfile, isOpponent, isBlack, onFriendAction }: PlayerInfoProps) {
  const { playerId: selfPlayerId, playerName: selfPlayerName, isGuest } = useGameStore();
  const friendshipStatus = useMemo(() => {
    if (!isOpponent || !selfProfile || !player) return 'none';
    if (selfProfile.friends?.includes(player.id)) return 'friends';
    if (selfProfile.sentFriendRequests?.includes(player.id)) return 'sent';
    return 'none';
  }, [selfProfile, player, isOpponent]);
  const handleFriendAction = async () => {
    if (!selfPlayerId || !selfPlayerName || !player) return;
    try {
      let message = '';
      if (friendshipStatus === 'none') {
        await api('/api/friends/request', {
          method: 'POST',
          body: JSON.stringify({ fromId: selfPlayerId, fromName: selfPlayerName, toId: player.id }),
        });
        message = 'Friend request sent!';
      } else if (friendshipStatus === 'friends') {
        await api(`/api/friends/${player.id}`, {
          method: 'DELETE',
          body: JSON.stringify({ selfId: selfPlayerId }),
        });
        message = 'Friend removed.';
      }
      toast.success(message);
      onFriendAction(); // Trigger profile refresh in parent
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.');
    }
  };
  const renderFriendButton = () => {
    if (!isOpponent || isGuest || !player || !selfProfile || selfPlayerId === player.id) {
      return null;
    }
    switch (friendshipStatus) {
      case 'friends':
        return (
          <Button onClick={handleFriendAction} variant="destructive" size="sm" className="h-7">
            <UserMinus className="mr-1 h-3 w-3" /> Friends
          </Button>
        );
      case 'sent':
        return (
          <Button disabled size="sm" className="h-7">
            <UserCheck className="mr-1 h-3 w-3" /> Sent
          </Button>
        );
      default:
        return (
          <Button onClick={handleFriendAction} variant="outline" size="sm" className="h-7 border-chess-blue text-chess-blue hover:bg-chess-blue hover:text-chess-dark">
            <UserPlus className="mr-1 h-3 w-3" /> Add
          </Button>
        );
    }
  };
  return (
    <div className={`w-full p-3 rounded-lg flex items-center justify-between gap-4 ${isBlack ? 'bg-black/30' : 'bg-white/10'}`}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-600 rounded-full">
          <User className="w-6 h-6 text-chess-light" />
        </div>
        <span className="font-semibold text-lg">{player?.name || '...'}</span>
      </div>
      {renderFriendButton()}
    </div>
  );
}