import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function FullWidth($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'max-w-full',
		alt: 'sample 1'
	});
}