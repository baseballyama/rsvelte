import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Autoplay($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		autoplay: true,
		controls: true,
		trackSrc: 'flowbite.mp4'
	});
}