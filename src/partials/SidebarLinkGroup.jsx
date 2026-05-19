import React, { useState } from 'react';

function SidebarLinkGroup({
  children,
  activecondition,
}) {

  const [open, setOpen] = useState(activecondition);

  const handleClick = () => {
    setOpen(!open);
  }

  return (
    <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${activecondition && 'from-emerald-500/[0.14] dark:from-emerald-500/[0.24] to-teal-500/[0.06]'}`}>
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;
