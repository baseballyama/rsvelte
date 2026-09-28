import * as $ from 'svelte/internal/server';
import ProfileMenuHeader from "carbon-components-svelte/UIShell/ProfileMenuHeader.svelte";

export default function ProfileMenuHeader_test($$renderer) {
	ProfileMenuHeader($$renderer, {
		'data-testid': 'default',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/'
	});

	$$renderer.push(`<!----> `);

	ProfileMenuHeader($$renderer, {
		'data-testid': 'custom',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/',
		text: 'Manage account'
	});

	$$renderer.push(`<!----> `);

	ProfileMenuHeader($$renderer, {
		'data-testid': 'hidden',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/',
		text: ''
	});

	$$renderer.push(`<!---->`);
}