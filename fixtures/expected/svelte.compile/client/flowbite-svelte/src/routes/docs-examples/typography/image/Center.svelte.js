import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Center($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'mx-auto max-w-lg',
		alt: 'sample 1'
	});
}