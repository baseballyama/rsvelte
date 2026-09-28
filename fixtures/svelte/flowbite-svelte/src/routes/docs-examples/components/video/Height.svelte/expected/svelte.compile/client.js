import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Height($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-80',
		trackSrc: 'flowbite.mp4'
	});
}