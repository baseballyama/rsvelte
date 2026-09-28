import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function Default($$renderer) {
	Progressbar($$renderer, { progress: '50' });
}