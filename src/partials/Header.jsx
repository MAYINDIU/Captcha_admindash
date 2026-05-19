import React from 'react';

import FastWorkBrand from '../components/FastWorkBrand';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {

  return (
    <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-emerald-50/95 dark:max-lg:before:bg-emerald-950/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-emerald-50 after:absolute after:h-px after:inset-x-0 after:top-full after:bg-emerald-100 dark:after:bg-emerald-800 after:-z-10' : 'max-lg:shadow-sm lg:before:bg-emerald-50/95 dark:lg:before:bg-emerald-950/90'} ${variant === 'v2' ? 'dark:before:bg-emerald-950' : ''} ${variant === 'v3' ? 'dark:before:bg-emerald-950' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-emerald-100 dark:border-emerald-800'}`}>

          {/* Header: Left side */}
          <div className="flex items-center gap-4">

            {/* Hamburger button */}
            <button
              className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-100 dark:hover:text-white lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            <div className="hidden md:block">
              <FastWorkBrand compact className="scale-90 origin-left" />
            </div>

          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <ThemeToggle />
            {/*  Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <UserMenu align="right" />

          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
