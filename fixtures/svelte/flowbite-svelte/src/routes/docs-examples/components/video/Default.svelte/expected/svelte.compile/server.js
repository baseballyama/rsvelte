import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Default($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		controls: true,
		trackSrc: 'flowbite.mp4'
	});
}