import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Blur($$anchor) {
	Img($$anchor, {
		src: '/images/examples/content-gallery-3.png',
		alt: 'My gallery',
		class: 'max-w-lg rounded-lg blur-xs transition-all duration-300 hover:blur-none'
	});
}