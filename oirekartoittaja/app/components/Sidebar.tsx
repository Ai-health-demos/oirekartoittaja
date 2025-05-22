'use client';

import React, { useState } from 'react';
import Drawer from './Drawer';
import Link from 'next/link';
import '@/app/styles/sidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <div className="sidebar">
      <button onClick={toggleDrawer} className="hamburger">
        ☰
      </button>
      {open && <Drawer toggleDrawer={toggleDrawer} />}
    </div>
  );
};

export default Sidebar;
