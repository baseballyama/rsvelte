import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Responsive($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-auto w-full max-w-full',
		trackSrc: 'flowbite.mp4'
	});
}