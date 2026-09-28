import * as $ from 'svelte/internal/server';
import { Progressbar } from "flowbite-svelte";

export default function LabelInside($$renderer) {
	Progressbar($$renderer, { progress: '50', size: 'h-4', labelInside: true });
}