import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Width($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'w-96',
		trackSrc: 'flowbite.mp4'
	});
}