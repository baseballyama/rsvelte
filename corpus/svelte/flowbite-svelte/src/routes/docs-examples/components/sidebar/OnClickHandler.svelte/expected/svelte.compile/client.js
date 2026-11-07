import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function OnClickHandler($$anchor) {
	const handleClick = () => {
		alert("Hello from SidebarDropdownWrapper.");
	};

	Sidebar($$anchor, {
		position: 'static',
		children: ($$anchor, $$slotProps) => {
			SidebarWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					SidebarGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node = $.first_child(fragment_3);

							{
								const icon = ($$anchor) => {
									ChartPieSolid($$anchor, {
										class: 'h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								SidebarItem(node, { label: 'Dashboard', icon, $$slots: { icon: true } });
							}

							var node_1 = $.sibling(node, 2);

							{
								const icon = ($$anchor) => {
									CartSolid($$anchor, {
										class: 'h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								const arrowup = ($$anchor) => {
									ChevronDoubleUpOutline($$anchor, { class: 'h-6 w-6' });
								};

								const arrowdown = ($$anchor) => {
									ChevronDoubleDownOutline($$anchor, { class: 'h-6 w-6' });
								};

								SidebarDropdownWrapper(node_1, {
									label: 'E-commerce',
									onclick: handleClick,
									icon,
									arrowup,
									arrowdown,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_2 = $.first_child(fragment_8);

										SidebarDropdownItem(node_2, { label: 'Products' });

										var node_3 = $.sibling(node_2, 2);

										SidebarDropdownItem(node_3, { label: 'Billing' });

										var node_4 = $.sibling(node_3, 2);

										SidebarDropdownItem(node_4, { label: 'Invoice' });
										$.append($$anchor, fragment_8);
									},
									$$slots: { icon: true, arrowup: true, arrowdown: true, default: true }
								});
							}

							$.append($$anchor, fragment_3);
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