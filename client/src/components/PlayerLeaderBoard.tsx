import React from "react";
import ReactGA from "react-ga4";
import { BASE_URL } from "../main";
import {
    Flex,
    Radio,
    RadioGroup,
    Spinner,
    Stack,
    Heading,
    Box,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";

//import TodoItem from "./TodoItem";
import { useQuery } from "@tanstack/react-query";
//import { BASE_URL } from "../App";

export type playerTotalScore = {
    UserName: string;
    FactionName: string;
    TotalPoints: number;
    NumberMatches: number;
    Average: number;
    Avatar: string;
};

function doSomething(dateString: string): string {
    //var userOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(dateString);
    const dateToTime = (date: Date) =>
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        });
    return dateToTime(localDate);
}

export type playerAPIResponse = {
    players_total: playerTotalScore[];
    updated_at: string;
};

const PlayerLeaderBoardTotalPoints = () => {
    const { data: playerTotalScore, isLoading } = useQuery<playerAPIResponse>({
        queryKey: ["playerTotalPoints"],
        queryFn: async () => {
            try {
                const res = await fetch(BASE_URL + "player_leaderboard");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }

                console.log(data);

                return data || [];
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 15 * 60 * 1000,
    });

    ReactGA.send({
        hitType: "pageview",
        page: "/player_leaderboard",
        title: "Player Scores",
    });

    const [value, setValue] = React.useState("All");

    return (
        <>
            {isLoading && (
                <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    h={"90%"}
                    w={"90%"}
                    my={4}
                    alignSelf={"center"}
                    justifySelf={"center"}
                >
                    <Spinner color="white" size={"xl"} />
                </Flex>
            )}
            {!isLoading && playerTotalScore?.players_total.length != 0 && (
                <>
                    {/*This is for the last updated part*/}
                    <Stack
                        flexDirection={"row"}
                        alignSelf={"end"}
                        //alignItems={"center"}
                        position={"absolute"}
                        top={"1.2em"}
                        right={"1em"}
                    >
                        <Text
                            textStyle="primary"
                            color={"#9bd1da"}
                            fontSize={"xs"}
                        >
                            Last updated at
                        </Text>
                        <Text
                            color={"white"}
                            fontSize={"xs"}
                            textStyle={"primary"}
                        >
                            {doSomething(playerTotalScore?.updated_at!) || ""}
                        </Text>
                    </Stack>
                    <Flex
                        background={"rgb(49, 62, 69, 0.3)"}
                        direction="column"
                        //position="relative"
                        alignSelf="center"
                        gap="10"
                        alignItems="center"
                        minWidth="60%"
                        maxWidth="70%"
                        h="100%"
                    >
                        {/*This container is of the Heading RadioGroup and Table*/}
                        <Flex
                            direction={"column"}
                            //position={"absolute"}
                            //transform="translateX(-50%)"
                            marginTop={"4em"}
                            marginLeft={"3em"}
                            //margin={"4em"}
                            justifyContent={"start"}
                        >
                            <Heading color={"#ffffff"}>
                                <Stack
                                    direction={"row"}
                                    alignItems={"end"}
                                    textStyle={"primary"}
                                    spacing={3}
                                >
                                    <Text
                                        fontSize={["3xl", "6xl"]}
                                        lineHeight={[5, 9]}
                                    >
                                        PLAYER
                                    </Text>
                                    <Text
                                        fontSize={["lg", "2xl"]}
                                        lineHeight={3}
                                    >
                                        LEADERBOARD
                                    </Text>
                                </Stack>
                            </Heading>

                            <Box
                                position="relative"
                                width="fit-content"
                                padding="1em"
                                _after={{
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "50%",
                                    backgroundColor: "rgb(21, 26, 29, 0.8)",
                                    clipPath:
                                        "polygon(0 50%, 96% 50%, 100% 100%, 0% 100%)",
                                    zIndex: 0,
                                }}
                                _before={{
                                    content: '""',
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "50%",
                                    backgroundColor: "rgb(21, 26, 29, 0.8)",
                                    clipPath:
                                        "polygon(0 0, 100% 0, 100% 50%, 4% 50%) ",
                                    zIndex: 0,
                                }}
                            >
                                {" "}
                                <RadioGroup
                                    flexDir={"row"}
                                    zIndex={1} // Ensure the RadioGroup is above the pseudo-element
                                    onChange={setValue}
                                    position="relative"
                                    value={value}
                                    transform={"skewX(30deg)"}
                                >
                                    <Stack
                                        direction={"row"}
                                        spacing={5}
                                        paddingX={"1em"}
                                        paddingY={"0.5em"}
                                        color={"white"}
                                        transform={"skewX(-30deg)"}
                                        textStyle={"primary"}
                                        //fontSize={"2xl"}
                                    >
                                        <Radio
                                            colorScheme="yellow"
                                            value="All"
                                            //fontSize={"2xl"}

                                            //transform= {"initial skewX(30deg)"}
                                            //transform={"skewX(30deg)"}
                                        >
                                            <Text fontSize={["xs", "md"]}>
                                                All Factions
                                            </Text>
                                        </Radio>
                                        <Radio colorScheme="blue" value="Sol">
                                            <Text fontSize={["xs", "md"]}>
                                                Sol
                                            </Text>
                                        </Radio>
                                        <Radio
                                            colorScheme="red"
                                            value="Centauri"
                                        >
                                            <Text fontSize={["xs", "md"]}>
                                                Centauri
                                            </Text>
                                        </Radio>
                                        <Radio
                                            colorScheme="green"
                                            value="Alien"
                                        >
                                            <Text fontSize={["xs", "md"]}>
                                                Aliens
                                            </Text>
                                        </Radio>
                                    </Stack>
                                </RadioGroup>
                            </Box>
                        </Flex>

                        <TableContainer
                            overflowY={"scroll"}
                            //marginTop={"15em"}
                            minWidth={"70%"}
                            maxWidth={"80%"}
                            borderX={"thick"}
                            borderY={"thick"}
                            marginBottom={"10%"}
                            padding={"0em"}
                            textStyle={"secondary"}
                        >
                            <Table
                                size={"sm"}
                                variant="unstyled"
                                borderX={"thick"}
                                borderColor={"white"}
                                style={{
                                    borderCollapse: "separate",
                                    borderSpacing: "0.25em 0.25em",
                                }}
                                borderY={"thick"}
                                textStyle={"secondary"}
                            >
                                <Thead
                                    textColor={"white"}
                                    marginBottom={"1em"}
                                    textStyle={"primary"}
                                    position="sticky"
                                    top={0}
                                    background={"rgb(49, 62, 69)"}
                                    zIndex={2}
                                >
                                    <Tr>
                                        <Th>
                                            <Text
                                                textStyle={"primary"}
                                                fontSize={["lg", "xl"]}
                                            >
                                                Rank
                                            </Text>
                                        </Th>
                                        <Th noOfLines={1}>
                                            <Text
                                                textStyle={"primary"}
                                                fontSize={["lg", "xl"]}
                                            >
                                                Username
                                            </Text>
                                        </Th>
                                        <Th>
                                            <Text
                                                textStyle="primary"
                                                fontSize={["lg", "xl"]}
                                            >
                                                Faction Name
                                            </Text>
                                        </Th>
                                        <Th>
                                            <Text
                                                textStyle="primary"
                                                fontSize={["lg", "xl"]}
                                            >
                                                Total Score
                                            </Text>
                                        </Th>
                                        <Th marginRight={"0em"} isNumeric>
                                            <Text
                                                textStyle="primary"
                                                fontSize={["lg", "xl"]}
                                            >
                                                Average
                                            </Text>
                                        </Th>
                                    </Tr>
                                </Thead>

                                <Tbody>
                                    {playerTotalScore?.players_total.map(
                                        (
                                            player: playerTotalScore,
                                            index: number,
                                        ) => {
                                            var color: string;
                                            if (player.FactionName == "Alien") {
                                                color = "0.5em solid #8aff87";
                                            } else if (
                                                player.FactionName == "Centauri"
                                            ) {
                                                color = "0.5em solid #e44b4d";
                                            } else if (
                                                player.FactionName == "Sol"
                                            ) {
                                                color = "0.5em solid #b4f4ff";
                                            } else {
                                                color = "0.5em solid #b4f4ff";
                                            }

                                            if (
                                                value != "All" &&
                                                value != player.FactionName
                                            ) {
                                                return;
                                            }

                                            return (
                                                <Tr
                                                    key={index}
                                                    color={"white"}
                                                    fontWeight={"bold"}
                                                    background={"#151a1d"}
                                                    //fontSize={["xs", "xl"]}
                                                >
                                                    <Td>{index + 1}</Td>
                                                    <Td paddingLeft={"0.5em"}>
                                                        <Flex
                                                            alignItems={
                                                                "center"
                                                            }
                                                            margin={"0em"}
                                                        >
                                                            <img
                                                                style={{
                                                                    background:
                                                                        "white",
                                                                    padding:
                                                                        "0em",
                                                                }}
                                                                src={
                                                                    player.Avatar
                                                                }
                                                                color="white"
                                                            />
                                                            <Text
                                                                paddingLeft={
                                                                    "1em"
                                                                }
                                                            >
                                                                {
                                                                    player.UserName
                                                                }
                                                            </Text>
                                                        </Flex>
                                                    </Td>
                                                    <Td borderLeft={color}>
                                                        {player.FactionName}
                                                    </Td>
                                                    <Td>
                                                        {player.TotalPoints}
                                                    </Td>
                                                    <Td>{player.Average}</Td>
                                                </Tr>
                                            );
                                        },
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Flex>
                </>
            )}
        </>
    );
};
export default PlayerLeaderBoardTotalPoints;
