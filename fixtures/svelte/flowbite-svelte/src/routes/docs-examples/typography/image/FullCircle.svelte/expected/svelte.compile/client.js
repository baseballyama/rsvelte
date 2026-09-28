import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function FullCircle($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-4@2x.jpg',
		alt: 'sample 1',
		class: 'h-96 w-96 rounded-full'
	});
}