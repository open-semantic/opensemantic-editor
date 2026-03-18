import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEditorStore } from "../store.js";
import { useShallow } from "zustand/react/shallow";
import { useCallback, useMemo } from "react";

const navigationItems = [
    {
        id: 'overview',
        title: 'Overview',
        path: '/overview',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        id: 'datasets',
        title: 'Datasets',
        path: '/datasets',
        yamlProperty: 'datasets',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
        ),
    },
    {
        id: 'relationships',
        title: 'Relationships',
        path: '/relationships',
        yamlProperty: 'relationships',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        ),
    },
    {
        id: 'metrics',
        title: 'Metrics',
        path: '/metrics',
        yamlProperty: 'metrics',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        id: 'custom-extensions',
        title: 'Custom Extensions',
        path: '/custom-extensions',
        yamlProperty: 'custom_extensions',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

const ACTIVE_CLASSES = 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600';
const INACTIVE_CLASSES = 'hover:bg-gray-100 hover:text-indigo-600 border-transparent';
const NAV_LINK_BASE = 'flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2';
const SUB_LINK_BASE = 'flex items-center py-1 transition-colors -mx-4 pl-10 pr-4 border-l-2';

const NavLink = ({ item, isActive, onClick }) => (
    <Link
        to={item.path}
        onClick={onClick}
        className={`${NAV_LINK_BASE} ${isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
    >
        <div className="size-4 shrink-0" aria-hidden="true">
            {item.icon || <div className="size-2 rounded-full bg-gray-300" />}
        </div>
        <p className="ml-1.5 text-sm font-medium">{item.title}</p>
    </Link>
);

const DatasetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const SidebarNavigation = ({ isMobile = false }) => {
    const {
        datasets,
        setView,
        currentView,
        isMobileSidebarOpen,
        closeMobileSidebar
    } = useEditorStore(useShallow((state) => ({
        datasets: state.getValue('semantic_model[0].datasets'),
        setView: state.setView,
        currentView: state.currentView,
        isMobileSidebarOpen: state.isMobileSidebarOpen,
        closeMobileSidebar: state.closeMobileSidebar
    })));

    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigationClick = useCallback((e, item) => {
        e.preventDefault();
        if (isMobile) closeMobileSidebar();

        switch (currentView) {
            case 'form':
                navigate(item.path);
                break;
            case 'yaml':
                navigate('/yaml');
                break;
            case 'diagram':
                if (item.yamlProperty === 'datasets') {
                    const datasetIndexMatch = item.path.match(/^\/datasets\/(\d+)$/);
                    if (datasetIndexMatch) {
                        navigate('/diagram');
                    } else {
                        setView('form');
                        navigate(item.path);
                    }
                } else {
                    setView('form');
                    navigate(item.path);
                }
                break;
            default:
                setView('form');
                navigate(item.path);
        }
    }, [isMobile, currentView, navigate, setView, closeMobileSidebar]);

    const isPathActive = useCallback((path) => location.pathname === path, [location.pathname]);

    const sidebarContent = useMemo(() => (
        <>
            <nav className="flex mt-2 w-full" aria-label="Navigation">
                <ol role="list" className="space-y-3 w-full">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
                            {item.id === 'datasets' ? (
                                <div>
                                    <NavLink
                                        item={item}
                                        isActive={isPathActive(item.path)}
                                        onClick={(e) => handleNavigationClick(e, item)}
                                    />
                                    {datasets?.length > 0 && (
                                        <ol className="mt-1 space-y-0.5">
                                            {datasets.filter(Boolean).map((dataset, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={`/datasets/${index}`}
                                                        onClick={(e) => handleNavigationClick(e, {
                                                            path: `/datasets/${index}`,
                                                            yamlProperty: 'datasets'
                                                        })}
                                                        className={`${SUB_LINK_BASE} text-sm ${isPathActive(`/datasets/${index}`) ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                                                    >
                                                        <div className="w-3 h-3 mr-1.5 shrink-0">
                                                            <DatasetIcon />
                                                        </div>
                                                        {dataset.name || `Dataset ${index + 1}`}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    item={item}
                                    isActive={isPathActive(item.path)}
                                    onClick={(e) => handleNavigationClick(e, item)}
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <a href="https://github.com/open-semantic-interchange/OSI" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    OSI Specification
                </a>
            </div>
        </>
    ), [datasets, handleNavigationClick, isPathActive]);

    if (isMobile) {
        return (
            <>
                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={closeMobileSidebar} />
                )}
                <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-900">Open Semantic Editor</span>
                        <button onClick={closeMobileSidebar} className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="h-[calc(100%-65px)] overflow-y-auto p-4 text-gray-700 font-medium flex flex-col">
                        {sidebarContent}
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="w-56 h-full overflow-y-auto border-r border-gray-300 bg-gray-50 p-4 shrink-0 text-gray-700 font-medium flex flex-col">
            {sidebarContent}
        </div>
    );
};

export default SidebarNavigation;
