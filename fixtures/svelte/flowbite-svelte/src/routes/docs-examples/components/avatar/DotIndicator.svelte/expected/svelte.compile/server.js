import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function DotIndicator($$renderer) {
	Avatar($$renderer, { src: '/images/profile-picture-3.webp', dot: { color: "red" } });
	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-3.webp',
		dot: { placement: "top-right", color: "red" },
		cornerStyle: 'rounded'
	});

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-5.webp',
		dot: { placement: "bottom-right", color: "green" }
	});

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-5.webp',
		dot: { placement: "bottom-right" },
		cornerStyle: 'rounded'
	});

	$$renderer.push(`<!----> `);
	Avatar($$renderer, { dot: {} });
	$$renderer.push(`<!---->`);
}