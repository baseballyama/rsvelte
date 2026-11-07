import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Default($$renderer) {
	Img($$renderer, { src: '/images/examples/image-1@2x.jpg', alt: 'sample 1' });
}