import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Caption($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		alt: 'sample 1',
		caption: 'Image caption'
	});
}