import * as $ from 'svelte/internal/server';
import UserAvatar from "carbon-components-svelte/UserAvatar/UserAvatar.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function UserAvatar_test($$renderer) {
	UserAvatar($$renderer, { 'data-testid': 'default' });
	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'initials-single', name: 'Eric' });
	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'initials-multi', name: 'John Doe' });
	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'initials-override',
		name: 'John Doe',
		initials: 'XY'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'image',
		name: 'Should Not Show',
		image: 'https://example.com/photo.jpg',
		imageDescription: 'A user photo'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'image-attributes',
		'data-avatar-host': 'true',
		name: 'Should Not Show',
		image: 'https://example.com/photo.jpg',
		imageDescription: 'A user photo',
		imageAttributes: {
			loading: "lazy",
			srcset: "https://example.com/photo.jpg 1x",
			referrerPolicy: "no-referrer"
		}
	});

	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'icon', name: 'Should Not Show', icon: Add });
	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'size-lg', size: 'lg', name: 'John Doe' });
	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'color-blue',
		backgroundColor: 'blue',
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'color-cool-gray',
		backgroundColor: 'cool-gray',
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'color-auto',
		backgroundColor: 'auto',
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'color-auto-2',
		backgroundColor: 'auto',
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'tooltip',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'tooltip-inline',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe',
		portalTooltip: false
	});

	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'events', name: 'John Doe' });
	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'slot',
		name: 'John Doe',
		children: ($$renderer) => {
			$$renderer.push(`<span>custom content</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'custom-class',
		class: 'my-class',
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'tooltip-overflow-marker',
		'data-avatar-group-overflow': 'true',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe'
	});

	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'interactive',
		interactive: true,
		name: 'John Doe'
	});

	$$renderer.push(`<!----> `);
	UserAvatar($$renderer, { 'data-testid': 'href', href: '/profile', name: 'John Doe' });
	$$renderer.push(`<!----> `);

	UserAvatar($$renderer, {
		'data-testid': 'href-over-interactive',
		href: '/profile',
		interactive: true,
		name: 'John Doe'
	});

	$$renderer.push(`<!---->`);
}