import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function Right($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		class: 'ms-auto max-w-lg',
		alt: 'sample 1'
	});
}