import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Caption($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		alt: 'sample 1',
		caption: 'Image caption'
	});
}