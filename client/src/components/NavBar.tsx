"use client";

import { Box, Flex, Text, Image, Link } from "@chakra-ui/react";
import silica_logo from "../assets/silica logo.svg";
import { Link as RouterLink, Outlet } from "react-router-dom";

export default function Nav() {
    return (
        <>
            <Box bg={"#313e45"} textStyle="primary" color={"white"} px={[2, 4]}>
                <Flex
                    h={[12, 16]}
                    //alignItems={"center"}
                    justify={"space-between"}
                    align={"center"}
                    width={"100%"}
                    //justifyContent={"space-between"}
                >
                    <Flex
                        w={["auto", "7em"]}
                        position={"relative"}
                        top={["0.5em", "1em"]}
                        //justifySelf={"center"}
                        alignSelf={"start"}
                        alignItems={"center"}
                        flexShrink={0}
                    >
                        <Image src={silica_logo} boxSize={["40px", "auto"]} />
                        <Text
                            position={"relative"}
                            left={["0.5em", "1em"]}
                            top={"0.1em"}
                            fontSize={["md", "xl"]}
                            borderLeft={"2px solid white"}
                            paddingLeft={["0.5em", "1em"]}
                            display={["block", "block"]}
                        >
                            LEADERBOARD
                        </Text>
                    </Flex>

                    <Flex
                        marginLeft={["0", "auto"]}
                        marginRight={["0", "auto"]}
                        left={"0"}
                        position={"relative"}
                        fontSize={["sm", "xl"]}
                        gap={["0.75em", "0"]}
                        flexWrap={["nowrap", "nowrap"]}
                        //="50%"

                        //padding={"10em"}
                    >
                        <Link
                            as={RouterLink}
                            to="commander_leaderboard"
                            position="relative"
                            _after={{
                                width: 0,
                                transition: "width 0.25s",
                                content: '""',
                                position: "absolute",
                                height: "2px",
                                backgroundColor: "#AAE5EF", // Underline color
                                bottom: "-2px",
                                left: "15%", // Center the underline
                            }}
                            _hover={{
                                textDecoration: "none", // Disable the default underline
                                color: "inherit",
                                _after: {
                                    width: "50%", // Adjust this value for a shorter underline
                                },
                                //transition: 'top ease 0.5s',
                            }}
                        >
                            <Text
                                marginRight={["0.5em", "1em"]}
                                borderRight={"2px solid white"}
                                fontSize={["sm", "xl"]}
                                paddingRight={["0.5em", "1em"]}
                            >
                                COMMANDER
                            </Text>
                        </Link>
                        <Link
                            as={RouterLink}
                            to="player_leaderboard"
                            position={"relative"}
                            _after={{
                                content: '""',
                                position: "absolute",
                                width: "0%", // Adjust this value for a shorter underline
                                transition: "width 0.25s",
                                height: "2px",
                                backgroundColor: "#AAE5EF", // Underline color
                                bottom: "-2px",
                                left: "10%", // Center the underline
                            }}
                            _hover={{
                                textDecoration: "none", // Disable the default underline
                                color: "inherit",
                                _after: {
                                    width: "40%", // Adjust this value for a shorter underline
                                },
                            }}
                        >
                            <Text
                                marginRight={["0.5em", "1em"]}
                                borderRight={"2px solid white"}
                                paddingRight={["0.5em", "1em"]}
                                fontSize={["sm", "xl"]}
                            >
                                PLAYER
                            </Text>
                        </Link>
                        <Link
                            as={RouterLink}
                            to="commander_leaderboard"
                            position={"relative"}
                            _after={{
                                content: '""',
                                position: "absolute",
                                width: "0%", // Adjust this value for a shorter underline
                                height: "2px",
                                backgroundColor: "#AAE5EF", // Underline color
                                bottom: "-2px",
                                left: "10%", // Center the underline
                                transition: "width 0.25s",
                            }}
                            _hover={{
                                textDecoration: "none", // Disable the default underline
                                color: "inherit",
                                _after: {
                                    width: "50%", // Adjust this value for a shorter underline
                                },
                            }}
                        >
                            <Text marginRight={["0.5em", "1em"]} fontSize={["sm", "xl"]}>
                                STATITICS
                            </Text>
                        </Link>
                    </Flex>
                </Flex>
            </Box>
            <Outlet />
        </>
    );
}
