import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Shadow($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-2@2x.jpg',
		alt: 'sample 1',
		class: 'max-w-xl shadow-xl dark:shadow-gray-800'
	});
}