import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Grayscale($$anchor) {
	Img($$anchor, {
		src: '/images/examples/content-gallery-3.png',
		alt: 'My gallery',
		class: 'max-w-lg cursor-pointer rounded-lg grayscale filter transition-all duration-300 hover:grayscale-0'
	});
}