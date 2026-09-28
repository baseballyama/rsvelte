import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Width($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'w-96',
		trackSrc: 'flowbite.mp4'
	});
}