import * as $ from 'svelte/internal/server';
import ProfileMenuItem from "carbon-components-svelte/UIShell/ProfileMenuItem.svelte";
import ProfileMenuList from "carbon-components-svelte/UIShell/ProfileMenuList.svelte";

export default function ProfileMenuList_test($$renderer) {
	ProfileMenuList($$renderer, {
		'data-testid': 'list',
		children: ($$renderer) => {
			ProfileMenuItem($$renderer, {
				href: '/settings',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProfileMenuItem($$renderer, {
				href: '/privacy',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Privacy`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}