'use client';

import React from 'react';
import Link from 'next/link';

interface DrawerProps {
  toggleDrawer: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ toggleDrawer }) => {
  return (
    <div className="drawer">
      <button onClick={toggleDrawer} className="close-drawer">×</button>
      <nav>
        <ul>
          <li>
            <Link href="/" onClick={toggleDrawer}>Etusivu</Link>
          </li>
          <li>
            <Link href="/createnew" onClick={toggleDrawer}>Luo uusi oirekysely</Link>
          </li>
          <li>
            <Link href="/questionnaires" onClick={toggleDrawer}>Kaikki oirekyselyt</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Drawer;
