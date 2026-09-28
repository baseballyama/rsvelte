import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function RoundedCorners($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		alt: 'sample 1',
		class: 'max-w-lg rounded-lg'
	});

	$$renderer.push(`<!----> `);

	Img($$renderer, {
		src: '/images/examples/image-4@2x.jpg',
		alt: 'sample 1',
		class: 'h-96 w-96 rounded-full'
	});

	$$renderer.push(`<!---->`);
}