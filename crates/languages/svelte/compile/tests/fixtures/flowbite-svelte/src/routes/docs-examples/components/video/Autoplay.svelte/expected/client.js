import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Autoplay($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		autoplay: true,
		controls: true,
		trackSrc: 'flowbite.mp4'
	});
}