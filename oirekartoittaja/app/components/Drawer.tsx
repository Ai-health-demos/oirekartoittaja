'use client';

import Link from 'next/link';
import React from 'react';

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
            <Link href="/editor" onClick={toggleDrawer}>Oirekyselymuokkaaja</Link>
          </li>
          <li>
            <Link href="/parser" onClick={toggleDrawer}>GraphML Muunnin</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Drawer;
