"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import { Tooltip } from "antd";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { MenuProps } from 'antd';
import { Dropdown, Typography } from 'antd';
import { ConfigProvider } from 'antd';
import {
    useWallet
} from "@aptos-labs/wallet-adapter-react";
import dynamic from "next/dynamic";

import { useAutoConnect } from '../provider/AutoConnectProvider';
import { useAlert } from "../provider/AlertProvider";
import { useUserContext } from '../context/UserContext';
import { useAppContext, ADMIN_PRIVATEKEY } from '../context/AppContext';

const allPages = [
    {name:'Home', link: '/'},
    {name: 'Discover', link: '/Discover'},
    {name: 'Profile', link: '/Profile'},
];

const onlyHomePages = [
    {name:'Home', link: '/'},
];

const Header = () => {
    const router = useRouter();
    const pathName = usePathname();
    const { account, connected, disconnect, wallet } = useWallet();
    const { notification, setNotification } = useAlert();
    const { fetchUserAddress, setUserAddress , userAddress} = useUserContext();
    const { 
        myBalance,
        setAdminAccount, 
        fetchAdminAccount,
        fetchBalance,
        fetchNftCollectionAddress,
        getAllListedNfts,
    } = useAppContext();
    const { setAutoConnect } = useAutoConnect();
    const { Paragraph } = Typography;
    const [badge, setBadge] = useState<number>(0);
    const sortedNotifications = [...notification].reverse();
    const [currentPage, setCurrentPage] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [pages, setPages] = useState(onlyHomePages);

    const clearAllNotifications = () => {
        localStorage.removeItem('aptos-notification');
        setNotification([]);
    };

    const logOut = () => {
        disconnect();
        localStorage.clear();
        setUserAddress(undefined);
        setNotification([]);
        router.push('/');
    };

    const copyWallet = (e: any) => {
        e.preventDefault();
        if (account?.address) {
            navigator.clipboard.writeText(`${account.address}`);
            setOpen(true);
        }
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
    
        setOpen(false);
    };

    const notifications: MenuProps['items'] = [
        ...sortedNotifications.map((notif, index) => ({
            key: index.toString(),
            label: notif,
        })),
        {
            key: (notification.length + 1).toString(),
            label: notification.length > 0 ? (
                <div onClick={clearAllNotifications} className="bg-slate-300 text-center mt-4 mb-2 hover:bg-red-600 hover:text-white px-4 py-2 rounded">
                    Clear all notifications
                </div>
            ) : (
                <div>
                    No Notifications
                </div>
            )
        }
    ];

    const profile: MenuProps['items'] = [
        {
            key: 1,
            label: (
                <Tooltip placement="left" arrow={false} color='#091a1f' title="Click to copy" overlayClassName='min-w-min' zIndex={1700}>
                    <Paragraph onClick={copyWallet} className='pt-3'>
                        {account ? `0x${account.address.substring(2, 6)}...${account.address.substring(account.address.length - 5, account.address.length)}` : ''}
                    </Paragraph>
                </Tooltip>
            )
        },
        {
            key: 2,
            label: (
                <div onClick={logOut} className="bg-slate-300 hover:bg-red-600 hover:text-white px-4 py-2 rounded">
                    Log Out
                </div>
            )
        }
    ];

    const WalletSelectorAntDesign = dynamic(
        () => import("../(components)/WalletSelectorAntDesign"),
        {
            loading: () => {
                return <CircularProgress color="secondary" size={30} className='mr-8'/>
            },
            suspense: false,
            ssr: false,
        }
    );

    useEffect(() => {
        if (ADMIN_PRIVATEKEY && userAddress) {
            const spaceshipAdminAccount = fetchAdminAccount(ADMIN_PRIVATEKEY);
            spaceshipAdminAccount.then(async (adminAccount: any) => {
                await setAdminAccount(adminAccount);
                await fetchNftCollectionAddress(adminAccount);
                await getAllListedNfts(adminAccount);
            })

            fetchBalance(userAddress);
        }
    }, [userAddress, ADMIN_PRIVATEKEY]);

    useEffect(() => {
        if (account) {
            setPages(allPages);
        } else {
            setPages(onlyHomePages);
        }
    }, [account]);
    
    useEffect(() => {
        setBadge(notification.length);
    }, [notification]);

    useEffect(() => {
        if (account) {
            fetchUserAddress();
            setAutoConnect(true);
        }
    }, [account]);

    useEffect(() => {
        if (pathName === '/') {
            setCurrentPage('Home');
        } else if (pathName === '/Discover') {
            setCurrentPage('Discover');
        } else if (pathName === '/Profile') {
            setCurrentPage('Profile');
        }
    },[pathName]);

    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" color='transparent'>
            <Toolbar className='flex place-items-center'>
                <div className='text-2xl text-[#e3e3e3]'>Aptos NFT Marketplace</div>

                <Box sx={{ display: { xs: 'none', sm: 'block' } }} className="flex space-x-2 place-items-center ml-6">
                    {pages.map((page) => (
                    <Button key={page.name} sx={{color: 'white'}} className={`font-semibold bg-[#091a1f] hover:border hover:rounded-full hover: px-6 py-2 rounded-full ${currentPage === page.name ? 'bg-[#f5f5f5] text-[#091a1f]' : ''}`}>
                        <Link href={page.link}>{page.name}</Link>
                    </Button>
                    ))}
                </Box>

                <Box sx={{ flexGrow: 1 }} />
                {connected ? (
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }} className='gap-5'>
                        <div className='flex w-auto place-content-center place-self-center bg-[#091a1f] px-4 py-2 rounded-full gap-5'>
                            <div className='place-self-center text-sm text-center text-white'>
                                Aptos Coin
                            </div>
                            <div className='flex place-content-center text-center bg-gray-700 px-4 py-1 w-auto rounded-full text-sm'>
                                <div>{myBalance} APT</div>
                            </div>
                        </div>

                        <ConfigProvider
                            theme={{
                                components: {
                                    Dropdown: {
                                        zIndexBase: 1600,
                                        zIndexPopup: 1600,
                                        zIndexPopupBase: 1600,
                                    },
                                },
                            }}
                        >
                            <Dropdown menu={{ items: notifications, style:{maxHeight: '50vh', overflow: 'auto', paddingTop: '10px', paddingBottom: '10px'}, className: 'notification' }} placement="bottomRight" arrow={{ pointAtCenter: true }} className='hover:text-[#25fff2]'>
                                <IconButton
                                    size="medium"
                                    aria-label={`show ${badge} new notifications`}
                                    color="inherit"
                                >
                                    <Badge badgeContent={badge} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Dropdown>

                            <Dropdown menu={{ items: profile, className: 'grid place-content-center text-center' }} trigger={['click']} placement="bottomRight">
                                <button className='flex gap-2 px-2 rounded-md border hover:text-[#25fff2] hover:border-[#25fff2]'>
                                    <img
                                        src={wallet?.icon}
                                        className='size-6 place-self-center'
                                    />
                                    <div className="place-self-center">
                                        {account ? `0x${account.address.substring(2, 6)}...${account.address.substring(account.address.length - 5, account.address.length)}` : ''}
                                    </div>
                                </button>
                            </Dropdown>
                        </ConfigProvider>
                    </Box>
                ) : (
                    <WalletSelectorAntDesign/>
                )}
            </Toolbar>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <div className='flex gap-2 bg-slate-500 px-4 py-4 rounded-md'>
                    <CheckCircleIcon className='text-lime-300'/>
                    Address Copied
                </div>
            </Snackbar>
        </AppBar>
        </Box>
    );
}

export default Header;