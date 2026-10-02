import * as $ from 'svelte/internal/server';
import { Tabs, TabItem } from "flowbite-svelte";

import {
	UserCircleSolid,
	GridSolid,
	AdjustmentsVerticalSolid,
	ClipboardSolid
} from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	Tabs($$renderer, {
		tabStyle: 'underline',
		children: ($$renderer) => {
			{
				function titleSlot($$renderer) {
					$$renderer.push(`<div class="flex items-center gap-2">`);
					UserCircleSolid($$renderer, { size: 'md' });
					$$renderer.push(`<!----> Profile</div>`);
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
					$$renderer.push(`<div class="flex items-center gap-2">`);
					GridSolid($$renderer, { size: 'md' });
					$$renderer.push(`<!----> Dashboard</div>`);
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
					$$renderer.push(`<div class="flex items-center gap-2">`);
					AdjustmentsVerticalSolid($$renderer, { size: 'md' });
					$$renderer.push(`<!----> Settings</div>`);
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
					$$renderer.push(`<div class="flex items-center gap-2">`);
					ClipboardSolid($$renderer, { size: 'md' });
					$$renderer.push(`<!----> Contacts</div>`);
				}

				TabItem($$renderer, {
					titleSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Contacts:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}