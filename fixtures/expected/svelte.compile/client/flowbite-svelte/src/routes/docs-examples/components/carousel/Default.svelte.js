import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Default($$anchor) {
	Carousel($$anchor, {
		get images() {
			return images;
		},
		duration: 3000
	});
}