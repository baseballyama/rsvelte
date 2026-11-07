import * as $ from 'svelte/internal/server';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarWrapper,
	SidebarDropdownItem,
	SidebarDropdownWrapper
} from "flowbite-svelte";

import {
	ChartPieSolid,
	CartSolid,
	ChevronDoubleUpOutline,
	ChevronDoubleDownOutline
} from "flowbite-svelte-icons";

export default function OnClickHandler($$renderer) {
	const handleClick = () => {
		alert("Hello from SidebarDropdownWrapper.");
	};

	Sidebar($$renderer, {
		position: 'static',
		children: ($$renderer) => {
			SidebarWrapper($$renderer, {
				children: ($$renderer) => {
					SidebarGroup($$renderer, {
						children: ($$renderer) => {
							{
								function icon($$renderer) {
									ChartPieSolid($$renderer, {
										class: 'h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								}

								SidebarItem($$renderer, { label: 'Dashboard', icon, $$slots: { icon: true } });
							}

							$$renderer.push(`<!----> `);

							{
								function icon($$renderer) {
									CartSolid($$renderer, {
										class: 'h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								}

								function arrowup($$renderer) {
									ChevronDoubleUpOutline($$renderer, { class: 'h-6 w-6' });
								}

								function arrowdown($$renderer) {
									ChevronDoubleDownOutline($$renderer, { class: 'h-6 w-6' });
								}

								SidebarDropdownWrapper($$renderer, {
									label: 'E-commerce',
									onclick: handleClick,
									icon,
									arrowup,
									arrowdown,
									children: ($$renderer) => {
										SidebarDropdownItem($$renderer, { label: 'Products' });
										$$renderer.push(`<!----> `);
										SidebarDropdownItem($$renderer, { label: 'Billing' });
										$$renderer.push(`<!----> `);
										SidebarDropdownItem($$renderer, { label: 'Invoice' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { icon: true, arrowup: true, arrowdown: true, default: true }
								});
							}

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}