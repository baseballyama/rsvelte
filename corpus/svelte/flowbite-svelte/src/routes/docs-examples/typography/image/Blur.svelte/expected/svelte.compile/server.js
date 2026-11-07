import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Blur($$renderer) {
	Img($$renderer, {
		src: '/images/examples/content-gallery-3.png',
		alt: 'My gallery',
		class: 'max-w-lg rounded-lg blur-xs transition-all duration-300 hover:blur-none'
	});
}