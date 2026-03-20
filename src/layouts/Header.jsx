import { useNavigate } from 'react-router-dom';
import { useEditorStore, initialYaml } from "../store.js";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import exampleYaml from '../example.yaml?raw';

const HamburgerIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header = () => {
    const navigate = useNavigate();
    const saveToFile = useEditorStore((state) => state.saveToFile);
    const loadFromFile = useEditorStore((state) => state.loadFromFile);
    const togglePreview = useEditorStore((state) => state.togglePreview);
    const toggleWarnings = useEditorStore((state) => state.toggleWarnings);
    const toggleMobileSidebar = useEditorStore((state) => state.toggleMobileSidebar);
    const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
    const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
    const markers = useEditorStore((state) => state.markers);
    const currentView = useEditorStore((state) => state.currentView);
    const setView = useEditorStore((state) => state.setView);
    const totalCount = markers.length;

    const handleViewChange = (view) => {
        setView(view);
        if (view === 'form') {
            navigate('/overview');
        } else if (view === 'yaml') {
            navigate('/yaml');
        } else if (view === 'diagram') {
            navigate('/diagram');
        }
    };

    const handleNew = () => {
        if (window.confirm('Create a new semantic model? Any unsaved changes will be lost.')) {
            const store = useEditorStore.getState();
            store.setYaml(initialYaml);
            store.setView('form');
            store.clearSaveInfo();
            navigate('/overview');
        }
    };

    const handleExample = () => {
        if (window.confirm('Load an example semantic model? Any unsaved changes will be lost.')) {
            const store = useEditorStore.getState();
            store.loadYaml(exampleYaml);
            store.clearSaveInfo();
            navigate('/overview');
        }
    };

    const handleSave = async () => {
        try {
            await saveToFile();
        } catch (error) {
            if (error.name === 'AbortError' || error.message === 'File selection cancelled') return;
            console.error('Error saving file:', error);
        }
    };

    const handleOpen = async () => {
        try {
            await loadFromFile();
            navigate('/overview');
        } catch (error) {
            if (error.name === 'AbortError' || error.message === 'File selection cancelled') return;
            console.error('Error opening file:', error);
        }
    };

    return (
        <nav className="border-b border-gray-300 bg-white text-gray-700">
            <div className="w-full px-2 md:px-4">
                <div className="flex w-full h-14 md:h-16 justify-between items-center gap-2">
                    {/* Mobile hamburger menu */}
                    <button
                        onClick={toggleMobileSidebar}
                        className="md:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        aria-label="Open menu"
                    >
                        <HamburgerIcon />
                    </button>

                    {/* Logo + title - left section */}
                    <div className="hidden md:flex flex-row flex-1 justify-start items-center gap-2">
                        <svg className="h-8 w-auto" viewBox="0 0 530 587" xmlns="http://www.w3.org/2000/svg"
                            style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
                            <path d="M508.5,119.94L307.4,3.84C288.5,-7.06 264.9,6.54 264.9,28.34L264.9,132.14L376.1,196.34C389.3,203.94 397.4,217.94 397.4,233.14L397.4,514.44L508.6,450.24C521.8,442.64 529.9,428.64 529.9,413.44L529.9,156.64C529.9,141.44 521.8,127.44 508.6,119.84L508.5,119.94Z"
                                style={{fill: "url(#_osi_L1)", fillRule: "nonzero"}}/>
                            <path d="M376,196.44L174.9,80.34C156,69.44 132.4,83.04 132.4,104.84L132.4,208.64L206,251.14L243.6,272.84C245.2,273.74 246.8,274.84 248.3,275.94C249.8,277.04 251.2,278.34 252.5,279.64C260.3,287.54 264.9,298.24 264.9,309.64L264.9,586.54C269.8,586.54 274.7,585.24 279.1,582.74L397.4,514.44L397.4,233.14C397.4,217.94 389.3,203.94 376.1,196.34L376,196.44Z"
                                style={{fill: "url(#_osi_L2)", fillRule: "nonzero"}}/>
                            <path d="M262.9,586.54C261.3,586.44 259.6,586.14 258,585.74C259.6,586.14 261.2,586.44 262.9,586.54Z"
                                style={{fill: "rgb(77,155,58)", fillRule: "nonzero"}}/>
                            <path d="M264.9,309.74C264.9,298.34 260.3,287.64 252.5,279.74C251.2,278.44 249.8,277.24 248.3,276.04C246.8,274.84 245.3,273.84 243.6,272.94L206,251.24L42.5,156.84C23.6,145.94 0,159.54 0,181.34L0,413.54C0,428.74 8.1,442.74 21.3,450.34L132.5,514.54L250.8,582.84C255.2,585.34 260.1,586.64 265,586.64L265,309.74L264.9,309.74Z"
                                style={{fill: "url(#_osi_L3)", fillRule: "nonzero"}}/>
                            <defs>
                                <linearGradient id="_osi_L1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(3.15004e-14,-514.44,514.44,3.15004e-14,397.4,514.44)">
                                    <stop offset="0" style={{stopColor: "rgb(134,25,143)", stopOpacity: 1}}/><stop offset="1" style={{stopColor: "rgb(134,25,143)", stopOpacity: 1}}/>
                                </linearGradient>
                                <linearGradient id="_osi_L2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(3.12309e-14,-510.04,510.04,3.12309e-14,264.9,586.54)">
                                    <stop offset="0" style={{stopColor: "rgb(192,38,211)", stopOpacity: 1}}/><stop offset="1" style={{stopColor: "rgb(217,70,239)", stopOpacity: 1}}/>
                                </linearGradient>
                                <linearGradient id="_osi_L3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(2.65528e-14,-433.64,433.64,2.65528e-14,132.5,586.64)">
                                    <stop offset="0" style={{stopColor: "rgb(217,70,239)", stopOpacity: 1}}/><stop offset="0.39" style={{stopColor: "rgb(229,112,247)", stopOpacity: 1}}/><stop offset="1" style={{stopColor: "rgb(232,121,249)", stopOpacity: 1}}/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="text-md leading-tight text-gray-900">Open Semantic Editor</span>
                    </div>

                    {/* Center: View tabs + Preview/Validation */}
                    <div className="flex flex-row flex-1 justify-center items-center">
                        {/* View toggle: Diagram | Form | YAML */}
                        <span className="isolate inline-flex rounded-md shadow-xs">
                            <button type="button"
                                onClick={() => handleViewChange('diagram')}
                                className={`relative inline-flex items-center gap-1 md:gap-1.5 rounded-l-md px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                                    currentView === 'diagram' ? 'bg-gray-100' : 'bg-white'
                                }`}>
                                <div className="size-3 md:size-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                </div>
                                Diagram
                            </button>
                            <button type="button"
                                onClick={() => handleViewChange('form')}
                                className={`relative -ml-px inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                                    currentView === 'form' ? 'bg-gray-100' : 'bg-white'
                                }`}>
                                <div className="size-3 md:size-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                Form
                            </button>
                            <button type="button"
                                onClick={() => handleViewChange('yaml')}
                                className={`relative -ml-px inline-flex items-center gap-1 md:gap-1.5 rounded-r-md px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                                    currentView === 'yaml' ? 'bg-gray-100' : 'bg-white'
                                }`}>
                                <div className="size-3 md:size-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                YAML
                            </button>
                        </span>

                        {/* Preview + Validation buttons */}
                        <span className="hidden md:inline-flex isolate rounded-md shadow-xs ml-2 xl:ml-4">
                            <button type="button"
                                onClick={togglePreview}
                                title="Preview"
                                className={`relative inline-flex items-center rounded-l-md px-2 xl:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 transition-colors ${
                                    isPreviewVisible ? 'bg-gray-100' : 'bg-white'
                                }`}>
                                <div className="size-4 lg:mr-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <span className="hidden lg:inline">Preview</span>
                            </button>
                            <button type="button"
                                onClick={toggleWarnings}
                                title="Validation"
                                className={`relative -ml-px inline-flex items-center rounded-r-md px-2 xl:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 transition-colors ${
                                    isWarningsVisible ? 'bg-gray-100' : 'bg-white'
                                }`}>
                                <span className="inline-flex items-center justify-center">
                                    <div className="size-4 lg:mr-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="hidden lg:inline">Validation</span>
                                    {totalCount === 0 ? (
                                        <span className="lg:ml-1 inline-flex items-center text-green-600" title="Valid">
                                            <div className="size-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </span>
                                    ) : (
                                        <span className="lg:ml-1.5 inline-flex items-center rounded-full px-1.5 py-[1.5px] text-[0.6rem] font-medium bg-red-100 text-red-700">
                                            {totalCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </span>
                    </div>

                    {/* Right: Save + burger menu */}
                    <div className="flex flex-row flex-shrink-0 md:flex-1 pr-0 justify-end items-center gap-1 md:gap-2 text-xs">
                        <button
                            className="inline-flex items-center justify-center gap-1 md:gap-2 rounded-md bg-indigo-600 px-2 md:px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-500"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <Menu as="div" className="relative inline-block">
                            <MenuButton
                                className="inline-flex items-center justify-center rounded-md bg-white px-2 md:px-3 py-1.5 text-xs font-semibold shadow-xs text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </MenuButton>

                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg outline outline-1 outline-black/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                            >
                                <div className="py-1">
                                    <MenuItem>
                                        <button
                                            onClick={handleNew}
                                            className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                            <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            New
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button
                                            onClick={handleExample}
                                            className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                            <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                            Load Example
                                        </button>
                                    </MenuItem>
                                </div>
                                <div className="py-1">
                                    <MenuItem>
                                        <button
                                            onClick={handleOpen}
                                            className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                            <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                            </svg>
                                            Open
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button
                                            onClick={handleSave}
                                            className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                            <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            Save
                                        </button>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
