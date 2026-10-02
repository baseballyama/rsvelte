import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Large($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'max-w-xl',
		alt: 'sample 1'
	});
}