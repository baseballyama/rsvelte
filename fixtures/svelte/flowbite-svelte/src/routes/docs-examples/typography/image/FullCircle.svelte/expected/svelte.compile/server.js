import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function FullCircle($$renderer) {
	Img($$renderer, {
		src: '/images/examples/image-4@2x.jpg',
		alt: 'sample 1',
		class: 'h-96 w-96 rounded-full'
	});
}