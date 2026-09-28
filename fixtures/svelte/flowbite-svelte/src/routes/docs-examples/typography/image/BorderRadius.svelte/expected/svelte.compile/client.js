import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

export default function BorderRadius($$anchor) {
	Img($$anchor, {
		src: '/images/examples/image-1@2x.jpg',
		alt: 'sample 1',
		class: 'max-w-lg rounded-lg'
	});
}