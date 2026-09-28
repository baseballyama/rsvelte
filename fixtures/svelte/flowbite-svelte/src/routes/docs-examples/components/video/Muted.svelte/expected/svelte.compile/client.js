import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Muted($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		autoplay: true,
		muted: true,
		controls: true,
		trackSrc: 'flowbite.mp4'
	});
}