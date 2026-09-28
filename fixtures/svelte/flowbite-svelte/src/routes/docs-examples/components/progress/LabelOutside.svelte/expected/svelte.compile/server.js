import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function LabelOutside($$renderer) {
	Progressbar($$renderer, { progress: '50', labelOutside: 'flowbite-svelte' });
}