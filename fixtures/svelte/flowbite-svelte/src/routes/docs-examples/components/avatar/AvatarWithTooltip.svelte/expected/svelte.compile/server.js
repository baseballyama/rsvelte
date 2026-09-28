import * as $ from 'svelte/internal/server';
import { Avatar, Tooltip } from "flowbite-svelte";

export default function AvatarWithTooltip($$renderer) {
	Avatar($$renderer, {
		'data-name': 'Jese Leos',
		src: '/images/profile-picture-1.webp'
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Jese Leos`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		'data-name': 'Robert Gouth',
		src: '/images/profile-picture-2.webp'
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Robert Gouth`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		'data-name': 'Bonnie Green',
		src: '/images/profile-picture-3.webp'
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bonnie Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}