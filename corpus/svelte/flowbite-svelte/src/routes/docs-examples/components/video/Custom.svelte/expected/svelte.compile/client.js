import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Custom($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-auto w-full max-w-full rounded-lg border border-gray-200 dark:border-gray-700',
		trackSrc: 'flowbite.mp4'
	});
}