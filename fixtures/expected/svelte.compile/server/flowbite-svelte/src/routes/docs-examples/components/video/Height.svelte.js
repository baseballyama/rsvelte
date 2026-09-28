import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Height($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-80',
		trackSrc: 'flowbite.mp4'
	});
}