import * as $ from 'svelte/internal/server';
import { Tabs, TabItem } from "flowbite-svelte";

export default function Underline($$renderer) {
	Tabs($$renderer, {
		tabStyle: 'underline',
		children: ($$renderer) => {
			TabItem($$renderer, {
				open: true,
				title: 'Profile',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabItem($$renderer, {
				title: 'Dashboard',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabItem($$renderer, {
				title: 'Settings',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabItem($$renderer, {
				title: 'Users',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function titleSlot($$renderer) {
					$$renderer.push(`<span class="text-gray-400 dark:text-gray-500">Disabled</span>`);
				}

				TabItem($$renderer, {
					disabled: true,
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Disabled:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}