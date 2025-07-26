
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, getDoc, limit, orderBy } from 'firebase/firestore';
import { Users, Swords, Percent, ListChecks, Gamepad2, Trophy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Game } from '@/components/game-table-client';
import Link from 'next/link';

export default function DashboardMetricsPage() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    gameCount: 0,
    memberCount: 0,
    drawnGamesPercentage: 0,
  });
  const [lastDrawnGame, setLastDrawnGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (orgId: string) => {
    try {
      // Fetch games
      const gamesQuery = query(collection(db, 'games_list'), where('organizationId', '==', orgId));
      const gamesSnapshot = await getDocs(gamesQuery);
      const gameCount = gamesSnapshot.size;
      const drawnGames = gamesSnapshot.docs.filter(doc => doc.data().wasDrawn).length;
      const drawnGamesPercentage = gameCount > 0 ? Math.round((drawnGames / gameCount) * 100) : 0;

      // Fetch members
      const membersQuery = query(collection(db, 'games_members'), where('organizationId', '==', orgId), where('role', '==', 'member'));
      const membersSnapshot = await getDocs(membersQuery);
      const memberCount = membersSnapshot.size;

      // Fetch last drawn game
      const lastDrawnGameQuery = query(
        collection(db, 'games_list'),
        where('organizationId', '==', orgId),
        orderBy('lastDrawnAt', 'desc'),
        limit(1)
      );
      const lastDrawnGameSnapshot = await getDocs(lastDrawnGameQuery);
      if (!lastDrawnGameSnapshot.empty) {
        setLastDrawnGame({ id: lastDrawnGameSnapshot.docs[0].id, ...lastDrawnGameSnapshot.docs[0].data() } as Game);
      }


      setMetrics({
        gameCount,
        memberCount,
        drawnGamesPercentage,
      });
    } catch (error) {
      console.error("Error fetching metrics: ", error);
       toast({ title: "Error", description: "Failed to fetch dashboard metrics.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDrawGame = async () => {
    if (!organizationId) {
        toast({ title: "Error", description: "Could not find your organization.", variant: "destructive" });
        return;
    }
    setDrawing(true);
    try {
        const undrawnGamesQuery = query(
            collection(db, 'games_list'),
            where('organizationId', '==', organizationId),
            where('wasDrawn', '==', false)
        );
        const undrawnGamesSnapshot = await getDocs(undrawnGamesQuery);
        if(undrawnGamesSnapshot.empty) {
            toast({ title: "No More Games", description: "All games have been drawn!", variant: "default" });
            return;
        }

        const undrawnGames = undrawnGamesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Game));
        const randomIndex = Math.floor(Math.random() * undrawnGames.length);
        const gameToDraw = undrawnGames[randomIndex];
        const gameDocRef = doc(db, 'games_list', gameToDraw.id);

        let updates: Partial<Game> = {
            lastDrawnAt: new Date(),
        };

        if (gameToDraw.type === 'casual') {
            const newDrawCount = (gameToDraw.drawCount || 0) + 1;
            updates.drawCount = newDrawCount;
            if (newDrawCount >= 5) {
                updates.wasDrawn = true;
            }
        } else if (gameToDraw.type === 'historical') {
            updates.wasDrawn = true;
        }

        await updateDoc(gameDocRef, updates);
        
        setLastDrawnGame({...gameToDraw, ...updates});
        toast({ title: "Game Drawn!", description: `You are playing: ${gameToDraw.name}` });
        // Refresh metrics
        fetchMetrics(organizationId);

    } catch (error) {
        console.error("Error drawing game: ", error);
        toast({ title: "Error", description: "Failed to draw a new game.", variant: "destructive" });
    } finally {
        setDrawing(false);
    }
  }


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const membersQuery = query(collection(db, 'games_members'), where('uid', '==', user.uid));
        const membersSnapshot = await getDocs(membersQuery);
        if (!membersSnapshot.empty) {
          const orgId = membersSnapshot.docs[0].data().organizationId;
          setOrganizationId(orgId);
          fetchMetrics(orgId);
        } else {
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchMetrics]);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
        <Button onClick={handleDrawGame} disabled={drawing}>
            <Trophy className="mr-2 h-4 w-4" />
            {drawing ? 'Drawing...' : 'Draw New Game'}
        </Button>
      </div>

      {lastDrawnGame && (
        <Card className="bg-primary/10 border-primary">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Next Game Up!</CardTitle>
                <CardDescription>This is the game to play until the next draw.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Gamepad2 className="h-10 w-10 text-primary" />
                        <div>
                            <h3 className="text-2xl font-bold">{lastDrawnGame.name}</h3>
                            <p className="text-muted-foreground capitalize">{lastDrawnGame.category} / {lastDrawnGame.type}</p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard/games">
                            View Game List <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Games</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.gameCount}</div>
            <p className="text-xs text-muted-foreground">Total games in your organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memberCount}</div>
            <p className="text-xs text-muted-foreground">Number of members with 'member' role</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drawn Games</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.drawnGamesPercentage}%</div>
            <p className="text-xs text-muted-foreground">Percentage of games already drawn</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
