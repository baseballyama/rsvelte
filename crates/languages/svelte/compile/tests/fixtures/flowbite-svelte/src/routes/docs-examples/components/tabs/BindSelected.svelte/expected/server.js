import * as $ from 'svelte/internal/server';
import { Tabs, TabItem, Button, P } from "flowbite-svelte";

export default function BindSelected($$renderer) {
	let selectedKey = "settings";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Tabs($$renderer, {
			get selected() {
				return selectedKey;
			},

			set selected($$value) {
				selectedKey = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				TabItem($$renderer, {
					key: 'profile',
					title: 'Profile',
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TabItem($$renderer, {
					key: 'settings',
					title: 'Settings',
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TabItem($$renderer, {
					key: 'users',
					title: 'Users',
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-4 text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Currently selected \`key\`: <strong>${$.escape(selectedKey)}</strong>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="mt-4 space-x-2">`);

		Button($$renderer, {
			onclick: () => selectedKey = "profile",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go to Profile`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selectedKey = "settings",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go to Settings`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selectedKey = "users",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go to Users`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}