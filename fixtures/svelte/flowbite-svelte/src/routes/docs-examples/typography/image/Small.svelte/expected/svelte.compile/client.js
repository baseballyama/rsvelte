import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Small($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'max-w-xs',
		alt: 'sample 1'
	});
}