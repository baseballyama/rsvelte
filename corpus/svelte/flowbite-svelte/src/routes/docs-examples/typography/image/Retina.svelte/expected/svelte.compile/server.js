import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Retina($$renderer) {
	Img($$renderer, {
		srcset: '/images/examples/image-1.jpg 1x, /images/examples/image-1@2x.jpg 2x',
		alt: 'sample 1',
		class: 'w-full max-w-xl rounded-lg'
	});
}