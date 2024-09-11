"use client";
import { usePathname } from 'next/navigation';
import Homepage from '../app/HomePage/page';
import Discover from './Discover/page';

export default function Home() {
  const pathName = usePathname();
  return (
    <>
      {pathName === '/' && <Homepage />}
      {pathName === '/Discover' && <Discover />}
    </>
  );
};