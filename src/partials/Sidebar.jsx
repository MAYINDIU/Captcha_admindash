import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { AiOutlineUsergroupAdd,AiOutlineTeam,AiFillSignal, AiFillAlert, AiFillAlipaySquare, AiFillBoxPlot   } from "react-icons/ai";

import { AiOutlineContainer,AiFillProduct,AiOutlineCluster ,AiOutlineUserSwitch   } from "react-icons/ai";
import { AiOutlineAudit } from "react-icons/ai";
import { AiTwotoneDiff,AiTwotoneProject  } from "react-icons/ai";
import { AiFillDatabase ,AiFillGold,AiFillAppstore,AiFillIdcard ,AiOutlineUngroup   } from "react-icons/ai";
import { FaHistory, FaMoneyBillWave, FaMoneyCheckAlt, FaComments, FaLock } from "react-icons/fa";

import { BiSolidPiano,BiSolidCopy ,BiSolidDice4 ,BiOutline,BiLayerPlus ,BiDoorOpen,BiDonateBlood ,BiSolidFilm ,BiWindows ,BiSolidStore ,BiSolidUserDetail,BiAddToQueue,BiDialpadAlt ,BiDialpad ,BiSortDown     } from "react-icons/bi";

import { BiBorderAll,BiAlarmExclamation  } from "react-icons/bi";
import FastWorkBrand from "../components/FastWorkBrand";
import { useChatNotifications } from "../hooks/useChatNotifications";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

// Get token

// console.log("Token:", token);
// console.log("User:", user);


  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);


    // Get employee (also stored as JSON)
  const employee = JSON.parse(localStorage.getItem("user"));
  // console.log(employee)
    const roles =  JSON.parse(localStorage.getItem("roles"));
    const role=employee?.role;
      const rank=employee?.employee?.rank;
  const { totalUnread } = useChatNotifications({ enabled: role === 'admin' });
// console.log(rank)

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:!flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-emerald-950 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-emerald-100 dark:border-emerald-800' : 'rounded-r-2xl shadow-sm ring-1 ring-emerald-100/80 dark:ring-emerald-800/80'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-5 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-emerald-700 hover:text-emerald-900"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/dashboard" className="block overflow-hidden">
            <FastWorkBrand labelClassName="lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200" />
          </NavLink>
        </div>



{/* Links */}
<div className="space-y-8">
  {/* If employee exists -> show only limited menu */}
  
  {role==='branch_admin' ? (
    <div>
      <ul className="mt-0">
        <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
          {(handleClick, open) => (
            <React.Fragment>
              <Link
                to="/dashboard"
                className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                  pathname === "/" || pathname.includes("/dashboard")
                    ? ""
                    : "hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => {
                  handleClick();
                  setSidebarExpanded(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className={`shrink-0 fill-current ${
                        pathname === "/" || pathname.includes("dashboard")
                          ? "text-emerald-700"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      </ul>

  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/create-sales")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/create-sales"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/create-sales") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/create-sales") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Create New Sale
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

    </div>
  ):

  role==='employee' ? (
    <div>
      <ul className="mt-0">
        <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
          {(handleClick, open) => (
            <React.Fragment>
              <Link
                to="/dashboard"
                className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                  pathname === "/" || pathname.includes("/dashboard")
                    ? ""
                    : "hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => {
                  handleClick();
                  setSidebarExpanded(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className={`shrink-0 fill-current ${
                        pathname === "/" || pathname.includes("dashboard")
                          ? "text-emerald-700"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      </ul>

                  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/employee-announcement-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/employee-announcement-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-announcement-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BiAlarmExclamation 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-announcement-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Notice List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   

 <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/employee-wallet-statement")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/employee-wallet-statement"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-wallet-statement") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BiAlarmExclamation 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-wallet-statement") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Employee Wallet Statement
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

<ul className="mt-1">
  <SidebarLinkGroup
    activecondition={
      pathname.includes("/promotion-list-employee") ||
      pathname.includes("/promotion-acheivement")||
      pathname.includes("/promotion-reward-transaction")
    }
  >
    {(handleClick, open) => (
      <>
        {/* Main Menu Link */}
        <a
          href="#0"
          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
            pathname.includes("/promotion-list-employee") ||
            pathname.includes("/promotion-acheivement")||
            pathname.includes("/promotion-reward-transaction")
              ? ""
              : "hover:text-gray-900 dark:hover:text-white"
          }`}
          onClick={(e) => {
            e.preventDefault();
            sidebarExpanded ? handleClick() : setSidebarExpanded(true);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AiFillGold
                className={`shrink-0 fill-current ${
                  pathname.includes("/promotion-list-employee") ||
                  pathname.includes("/promotion-acheivement")
                    ? "text-emerald-700"
                    : "text-dark dark:text-dark"
                }`}
              />
              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                Promotions
              </span>
            </div>

            {/* Dropdown Arrow */}
            <div className="flex shrink-0 ml-2">
              <svg
                className={`w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 ${
                  open && "rotate-180"
                }`}
                viewBox="0 0 12 12"
              >
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </div>
          </div>
        </a>

        {/* Submenu */}
        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
          <ul className={`pl-9 mt-1 ${!open && "hidden"}`}>
            
            {/* Promotional List */}
            <li className="mb-1 last:mb-0">
              <Link
                to="/promotion-list-employee"
                className={`block transition duration-150 truncate ${
                  pathname.includes("/promotion-list-employee")
                    ? "text-emerald-700 font-semibold"
                    : "text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="text-sm font-medium">
                  Promotional List
                </span>
              </Link>
            </li>

            {/* Promotion Achievement */}
            <li className="mb-1 last:mb-0">
              <Link
                to="/promotion-acheivement"
                className={`block transition duration-150 truncate ${
                  pathname.includes("/promotion-acheivement")
                    ? "text-emerald-700 font-semibold"
                    : "text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="text-sm font-medium">
                  Promotion Achievement
                </span>
              </Link>
            </li>
               {/* Promotion Achievement */}
            <li className="mb-1 last:mb-0">
              <Link
                to="/promotion-reward-transaction"
                className={`block transition duration-150 truncate ${
                  pathname.includes("/promotion-reward-transaction")
                    ? "text-emerald-700 font-semibold"
                    : "text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="text-sm font-medium">
                  Promotion Reward Transaction
                </span>
              </Link>
            </li>

            

          </ul>
        </div>
      </>
    )}
  </SidebarLinkGroup>
</ul>


                   
                  

                  
  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/customer-list-emp")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/customer-list-emp"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-list-emp") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineTeam 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-list-emp") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              My Customers
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>


  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/add-work-summary")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/add-work-summary"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/add-work-summary") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineTeam 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/add-work-summary") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            Add Work Summary
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/my-team-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/my-team-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/my-team-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineTeam 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/my-team-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                           My Associate
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   
                   

       <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/withdrawal-req-employee")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/withdrawal-req-employee"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/withdrawal-req-employee") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/withdrawal-req-employee") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Withdrwal Request
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>



  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/commission-list-employyee")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/commission-list-employyee"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/commission-list-employyee") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineAudit 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/commission-list-employyee") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              My Commission 
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                  
                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/employee-month-incentive-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/employee-month-incentive-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-month-incentive-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineAudit 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-month-incentive-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Monthly Incentive List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                   
               <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/my-sales-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/my-sales-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/my-sales-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillAlert 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/my-sales-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              My Sales List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/employee-request-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/employee-request-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-request-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillAlert 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/employee-request-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Employee Request List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   


{/* Only show this block if rank is NOT "ME" */}
{rank !== "ME" && (
  <ul className="mt-1">
    <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/employee-add-request")}>
      {(handleClick, open) => {
        return (
          <React.Fragment>
            <Link
              to="/employee-add-request"
              className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                pathname === "/employee-add-request" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10" // Optional: highlight background if active
                  : "hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => {
                handleClick();
                setSidebarExpanded(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AiFillAlert 
                    className={`shrink-0 fill-current ${
                      pathname.includes("/employee-add-request") 
                        ? 'text-emerald-700' 
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                    size={16}
                  />
                  <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Employee Add Request
                  </span>
                </div>
              </div>
            </Link>
          </React.Fragment>
        );
      }}
    </SidebarLinkGroup>
  </ul>
)}






                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/password-change")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/password-change"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/password-change") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiTwotoneProject 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/password-change") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                           Change Password
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

    </div>
  )
  
  : // This is the 'false' part of the first ternary
  role === 'agent' ? (
      <div>
      <ul className="mt-0">
        <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
          {(handleClick, open) => (
            <React.Fragment>
              <Link
                to="/dashboard"
                className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                  pathname === "/" || pathname.includes("/dashboard")
                    ? ""
                    : "hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => {
                  handleClick();
                  setSidebarExpanded(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className={`shrink-0 fill-current ${
                        pathname === "/" || pathname.includes("dashboard")
                          ? "text-emerald-700"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      </ul>



        <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-sales-summary")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-sales-summary"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-sales-summary") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-sales-summary") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Agent Sales Summary
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                      <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-wallet-statement")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-wallet-statement"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-wallet-statement") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-wallet-statement") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Wallet Statements
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                   
                   
        <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-payment-settlement")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-payment-settlement"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-payment-settlement") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-payment-settlement") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Payment Statements
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   

  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-create-sales")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-create-sales"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-create-sales") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-create-sales") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Create New Sale
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-sale-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-sale-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-sale-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-sale-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              All Sale List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                
                  
                       <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-commission-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-commission-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-commission-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-commission-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                               Commission List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>


            <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/withdrawal-req-agent")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/withdrawal-req-agent"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/withdrawal-req-agent") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/withdrawal-req-agent") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                               Withdraw List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                   

                    <ul className="mt-1">
  <SidebarLinkGroup
    activecondition={pathname.includes("/create-customer-agent") || pathname.includes("/create-customer-agent")}
  >
    {(handleClick, open) => {
      return (
        <React.Fragment>
          {/* Main Menu Link */}
          <a
            href="#0"
            className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
              (pathname.includes("/create-customer-agent") || pathname.includes("/create-customer-agent"))
                ? ""
                : "hover:text-gray-900 dark:hover:text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              sidebarExpanded ? handleClick() : setSidebarExpanded(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AiFillGold 
                  className={`shrink-0 fill-current ${
                    (pathname.includes("/create-customer-agent") || pathname.includes("/create-customer-agent"))
                      ? 'text-emerald-700' 
                      : 'text-dark dark:text-dark'}`}
                />
                <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                Customer
                </span>
              </div>
              {/* Dropdown Arrow */}
              <div className="flex shrink-0 ml-2">
                <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                  <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                </svg>
              </div>
            </div>
          </a>
          {/* Submenu */}
          <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
            <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
              {/* Submenu Link 1 */}
              <li className="mb-1 last:mb-0">
                <Link
                  to="/create-customer-agent"
                  className={`block text-gray-800 dark:text-gray-100 transition duration-150 truncate ${
                    pathname.includes("/create-customer-agent") 
                      ? 'text-emerald-700 font-semibold' 
                      : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                   Add New Customer
                  </span>
                </Link>
              </li>
         
            </ul>
          </div>
        </React.Fragment>
      );
    }}
  </SidebarLinkGroup>
                   </ul> 



                   
  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/agent-customer-payment")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/agent-customer-payment"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-customer-payment") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/agent-customer-payment") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                               Payment Customer
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                  
    </div>
  ) 
  
  : // This is the 'false' part of the first ternary
  role === 'customer' ? (
      <div>
      <ul className="mt-0">
        <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
          {(handleClick, open) => (
            <React.Fragment>
              <Link
                to="/dashboard"
                className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                  pathname === "/" || pathname.includes("/dashboard")
                    ? ""
                    : "hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => {
                  handleClick();
                  setSidebarExpanded(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className={`shrink-0 fill-current ${
                        pathname === "/" || pathname.includes("dashboard")
                          ? "text-emerald-700"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      </ul>

  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/installment-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/installment-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/installment-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BiDialpad  
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/installment-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Installment List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/customer-order-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/customer-order-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-order-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BiSortDown  
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-order-list") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                             Order List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

             
             
  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/customer-payment-history")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/customer-payment-history"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-payment-history") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/customer-payment-history") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                           Payment History
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("/change-password")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/change-password"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/" || pathname.includes("dashboard") || pathname.includes("/change-password") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiFillSignal 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") || pathname.includes("/change-password") 
                                  ? 'text-emerald-700' 
                                  : 'text-dark dark:dark'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                           Change Password
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

    </div>
  ) 
  
  : role === 'admin' ? (
    // If no employee -> show full admin menus
    <div>
     {/* Links */}
         <div className="space-y-8">
        
              
                 <div>
                  {/* Master settings */}
                <ul className="mt-0">
                    {/* Dashboard */}
                    <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
                      {(handleClick, open) => {
                        return (
                          <React.Fragment>
                            <Link
                              to="/dashboard"
                              className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                                pathname === "/"  || pathname.includes("/dashboard") ? "" : "hover:text-gray-900 dark:hover:text-white"
                              }`}
                              onClick={() => {
                                handleClick();
                                setSidebarExpanded(true);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                <svg 
                                className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") ? 'text-emerald-700' : 'text-gray-400 dark:text-gray-500'}`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z"/>
                              </svg>                        
                                  <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                    Dashboard
                                  </span>
                                </div>
                            
                              </div>
                              </Link>
                          
                          </React.Fragment>
                        );
                      }}
                    </SidebarLinkGroup>
                  </ul>
          
            <ul className="mt-0">
            <SidebarLinkGroup activecondition={pathname.includes("/all-users")}>
              {(handleClick, open) => (
                <React.Fragment>
                  <Link
                    to="/all-users"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("/all-users")
                        ? "text-emerald-700"
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      handleClick();
                      setSidebarExpanded(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AiOutlineUsergroupAdd
                          className={`shrink-0 w-5 h-5 ${
                            pathname.includes("/all-users")
                              ? "text-emerald-700"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      All Users
                        </span>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              )}
            </SidebarLinkGroup>
                      </ul>
                      
               <ul className="mt-0">
            <SidebarLinkGroup activecondition={pathname.includes("/withdrawal-list-trn-list")}>
              {(handleClick, open) => (
                <React.Fragment>
                  <Link
                    to="/withdrawal-list-trn-list"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("/withdrawal-list-trn-list")
                        ? "text-emerald-700"
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      handleClick();
                      setSidebarExpanded(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaMoneyBillWave
                          className={`shrink-0 w-5 h-5 ${
                            pathname.includes("/withdrawal-list-trn-list")
                              ? "text-emerald-700"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                   Withdrawal & Transactions
                        </span>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              )}
            </SidebarLinkGroup>
                      </ul>


                      

                         <ul className="mt-0">
            <SidebarLinkGroup activecondition={pathname.includes("/verification-list")}>
              {(handleClick, open) => (
                <React.Fragment>
                  <Link
                    to="/verification-list"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("/verification-list")
                        ? "text-emerald-700"
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      handleClick();
                      setSidebarExpanded(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AiFillIdcard
                          className={`shrink-0 w-5 h-5 ${
                            pathname.includes("/verification-list")
                              ? "text-emerald-700"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                 Verification List
                        </span>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              )}
            </SidebarLinkGroup>
                      </ul>
                      

   <ul className="mt-0">
            <SidebarLinkGroup activecondition={pathname.includes("/chat")}>
              {(handleClick, open) => (
                <React.Fragment>
                  <Link
                    to="/chat"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("/chat")
                        ? "text-emerald-700"
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      handleClick();
                      setSidebarExpanded(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative shrink-0">
                          <FaComments
                            className={`shrink-0 w-5 h-5 ${
                              pathname.includes("/chat")
                                ? "text-emerald-700"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          />
                          {totalUnread > 0 && (
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 animate-pulse" />
                          )}
                        </div>
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                  Chat
                        </span>
                      </div>
                      {totalUnread > 0 && (
                        <span className="ml-2 hidden min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-[10px] font-black text-white lg:sidebar-expanded:flex 2xl:flex items-center justify-center shadow-sm shadow-red-200">
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                      )}
                    </div>
                  </Link>
                </React.Fragment>
              )}
            </SidebarLinkGroup>
                      </ul>

                      <ul className="mt-0">
  <SidebarLinkGroup activecondition={pathname.includes("/password-change")}>
    {(handleClick, open) => (
      <React.Fragment>
        <Link
          to="/password-change"
          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
            pathname.includes("/password-change")
              ? "text-emerald-700"
              : "hover:text-gray-900 dark:hover:text-white"
          }`}
          onClick={() => {
            handleClick();
            setSidebarExpanded(true);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaLock
                className={`shrink-0 w-5 h-5 ${
                  pathname.includes("/password-change")
                    ? "text-emerald-700"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              Password Change
              </span>
            </div>
          </div>
        </Link>
      </React.Fragment>
    )}
  </SidebarLinkGroup>
                      </ul>

                 

                </div>
                
         




         
        </div>
    </div>
  ): (
    
    <div>
      <h2>Not match role</h2>
    </div>
  )}
</div>




    

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-emerald-500 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-100" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-emerald-500 dark:text-emerald-300 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

