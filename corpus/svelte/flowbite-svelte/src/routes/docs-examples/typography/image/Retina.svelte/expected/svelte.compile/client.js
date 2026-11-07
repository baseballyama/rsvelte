import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Retina($$anchor) {
	Img($$anchor, {
		srcset: '/images/examples/image-1.jpg 1x, /images/examples/image-1@2x.jpg 2x',
		alt: 'sample 1',
		class: 'w-full max-w-xl rounded-lg'
	});
}