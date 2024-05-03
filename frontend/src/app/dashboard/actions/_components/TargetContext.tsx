import { Graph } from '@/types';
import { createContext } from 'react';
import React, { useState } from 'react';

interface TargetContextValue {
    teamGraph: Graph;
    opponentGraph: Graph;
    setTeamGraph: (teamGraph: Graph) => void;
    setOpponentGraph: (opponentGraph: Graph) => void;
}

export const TargetContext = createContext<TargetContextValue>({
    teamGraph: {
        nodes: [],
        edges: []
    },
    opponentGraph: {
        nodes: [],
        edges: []
    },
    setTeamGraph: (teamGraph: Graph) => {},
    setOpponentGraph: (opponentGraph: Graph) => {}
});

interface TargetContextProviderProps {
    children: React.ReactNode;
}

export function TargetContextProvider({ children }: TargetContextProviderProps) {
    const [teamGraph, setTeamGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [opponentGraph, setOpponentGraph] = useState<Graph>({ nodes: [], edges: [] });

    return (
        <TargetContext.Provider value={{ teamGraph, opponentGraph, setTeamGraph, setOpponentGraph }}>
            {children}
        </TargetContext.Provider>
    );
}