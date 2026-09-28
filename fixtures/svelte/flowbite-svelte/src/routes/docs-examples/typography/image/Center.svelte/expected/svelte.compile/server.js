import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Center($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'mx-auto max-w-lg',
		alt: 'sample 1'
	});
}