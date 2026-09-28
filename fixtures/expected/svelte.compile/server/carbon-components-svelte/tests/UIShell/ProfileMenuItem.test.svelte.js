import * as $ from 'svelte/internal/server';
import ProfileMenuItem from "carbon-components-svelte/UIShell/ProfileMenuItem.svelte";
import Logout from "carbon-icons-svelte/lib/Logout.svelte";

export default function ProfileMenuItem_test($$renderer) {
	ProfileMenuItem($$renderer, {
		'data-testid': 'with-icon',
		icon: Logout,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Log out`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ProfileMenuItem($$renderer, {
		'data-testid': 'no-icon',
		href: '/settings',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Settings`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}