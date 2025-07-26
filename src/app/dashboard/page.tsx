
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Swords, Percent, ListChecks } from 'lucide-react';

export default function DashboardMetricsPage() {
  const [metrics, setMetrics] = useState({
    gameCount: 0,
    memberCount: 0,
    drawnGamesPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
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

      setMetrics({
        gameCount,
        memberCount,
        drawnGamesPercentage,
      });
    } catch (error) {
      console.error("Error fetching metrics: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
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
