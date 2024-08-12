import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import CommanderLeaderBoard from "./components/CommanderLeaderBoard.tsx";
import PlayerLeaderBoard from "./components/PlayerLeaderBoard.tsx";
import NavBar from "./components/NavBar.tsx";
import img from "./assets/BG.png";
import "@fontsource/bebas-neue";
import "@fontsource-variable/open-sans";

import ReactGA from "react-ga4";

ReactGA.initialize("G-KEQB76GLKC");

export const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:4000/api/"
        : "/api/";

import {
    //createBrowserRouter,
    RouterProvider,
    Route,
    createRoutesFromElements,
    createHashRouter,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//<Route path="/" element={<Root />}>
const router = createHashRouter(
    createRoutesFromElements(
        <Route path="/" element={<NavBar />}>
            <Route path="/player_leaderboard" element={<PlayerLeaderBoard />} />
            <Route
                path="/commander_leaderboard"
                element={<CommanderLeaderBoard />}
            />
        </Route>,
    ),
);

const theme = extendTheme({
    // Whatever you pass here will be ADDED to the theme.
    textStyles: {
        primary: {
            fontFamily: `'Bebas Neue', sans-serif`,
        },
        secondary: {
            fontFamily: `'Open Sans Regular', sans-serif`,
        },
    },
});

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ChakraProvider theme={theme} cssVarsRoot="body">
            <QueryClientProvider client={queryClient}>
                <Box
                    bgImg={img}
                    width={"100vw"}
                    height={"100vh"}
                    display={"flex"}
                    flexDirection={"column"}
                    overflowY={"scroll"}
                >
                    <RouterProvider router={router} />
                </Box>
            </QueryClientProvider>
        </ChakraProvider>
    </React.StrictMode>,
);
