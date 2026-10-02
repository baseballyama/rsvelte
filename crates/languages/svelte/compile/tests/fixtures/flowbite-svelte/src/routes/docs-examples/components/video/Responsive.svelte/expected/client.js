import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Responsive($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		controls: true,
		class: 'h-auto w-full max-w-full',
		trackSrc: 'flowbite.mp4'
	});
}