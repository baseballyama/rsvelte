import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Grayscale($$renderer) {
	Img($$renderer, {
		src: '/images/examples/content-gallery-3.png',
		alt: 'My gallery',
		class: 'max-w-lg cursor-pointer rounded-lg grayscale filter transition-all duration-300 hover:grayscale-0'
	});
}