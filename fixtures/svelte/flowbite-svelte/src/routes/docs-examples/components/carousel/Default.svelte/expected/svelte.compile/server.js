import * as $ from 'svelte/internal/server';
import { Carousel } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Default($$renderer) {
	Carousel($$renderer, { images, duration: 3000 });
}