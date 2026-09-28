import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video } from "flowbite-svelte";

export default function Default($$anchor) {
	Video($$anchor, {
		src: '/videos/flowbite.mp4',
		controls: true,
		trackSrc: 'flowbite.mp4'
	});
}