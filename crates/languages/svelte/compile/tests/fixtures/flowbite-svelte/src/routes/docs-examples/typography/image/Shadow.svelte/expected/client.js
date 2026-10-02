import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Shadow($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-2@2x.jpg',
		alt: 'sample 1',
		class: 'max-w-xl shadow-xl dark:shadow-gray-800'
	});
}