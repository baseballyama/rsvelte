import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Right($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'ms-auto max-w-lg',
		alt: 'sample 1'
	});
}