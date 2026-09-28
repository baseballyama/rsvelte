import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Status($$renderer) {
	Avatar($$renderer, {
		src: '/images/profile-picture-5.webp',
		dot: { color: "green", size: "lg", placement: "top-right" }
	});

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		src: '/images/profile-picture-5.webp',
		dot: { color: "red", size: "lg", placement: "top-right" }
	});

	$$renderer.push(`<!---->`);
}