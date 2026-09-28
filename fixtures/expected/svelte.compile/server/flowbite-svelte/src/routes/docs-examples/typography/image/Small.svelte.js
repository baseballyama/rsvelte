import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Small($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'max-w-xs',
		alt: 'sample 1'
	});
}