import * as $ from 'svelte/internal/server';
import { Video } from "flowbite-svelte";

export default function Custom($$renderer) {
	Video($$renderer, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-auto w-full max-w-full rounded-lg border border-gray-200 dark:border-gray-700',
		trackSrc: 'flowbite.mp4'
	});
}