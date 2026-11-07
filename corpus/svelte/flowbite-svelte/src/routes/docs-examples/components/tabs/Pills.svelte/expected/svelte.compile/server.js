import * as $ from 'svelte/internal/server';
import { Tabs, TabItem } from "flowbite-svelte";

export default function Pills($$renderer) {
	Tabs($$renderer, {
		tabStyle: 'pill',
		children: ($$renderer) => {
			{
				function titleSlot($$renderer) {
					$$renderer.push(`<span>Profile</span>`);
				}

				TabItem($$renderer, {
					open: true,
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function titleSlot($$renderer) {
					$$renderer.push(`<span>Dashboard</span>`);
				}

				TabItem($$renderer, {
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function titleSlot($$renderer) {
					$$renderer.push(`<span>Settings</span>`);
				}

				TabItem($$renderer, {
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function titleSlot($$renderer) {
					$$renderer.push(`<span>Users</span>`);
				}

				TabItem($$renderer, {
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}