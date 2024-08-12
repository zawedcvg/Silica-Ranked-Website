"use client";

import { Box, Flex, Text, Image, Link } from "@chakra-ui/react";
import silica_logo from "../assets/silica logo.svg";
import { Link as RouterLink, Outlet } from "react-router-dom";

export default function Nav() {
    return (
        <>
            <Box bg={"#313e45"} textStyle="primary" color={"white"} px={4}>
                <Flex
                    h={16}
                    //alignItems={"center"}
                    justify={"space-between"}
                    align={"center"}
                    width={"100%"}
                    //justifyContent={"space-between"}
                >
                    <Flex
                        w="7em"
                        position={"relative"}
                        top={"1em"}
                        //justifySelf={"center"}
                        alignSelf={"start"}
                        alignItems={"center"}
                    >
                        <Image src={silica_logo} />
                        <Text
                            position={"relative"}
                            left={"1em"}
                            top={"0.1em"}
                            fontSize={"xl"}
                            borderLeft={"2px solid white"}
                            paddingLeft={"1em"}
                        >
                            LEADERBOARD
                        </Text>
                    </Flex>

                    <Flex
                        marginLeft={"auto"}
                        marginRight={"auto"}
                        left={"0"}
                        position={"relative"}
                        fontSize={"xl"}
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
                                marginRight={"1em"}
                                borderRight={"2px solid white"}
                                fontSize={"xl"}
                                paddingRight={"1em"}
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
                                marginRight={"1em"}
                                borderRight={"2px solid white"}
                                paddingRight={"1em"}
                                fontSize={"xl"}
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
                            <Text marginRight={"1em"} fontSize={"xl"}>
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
