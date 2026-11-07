import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

export default function LabelInside($$anchor) {
	Progressbar($$anchor, { progress: '50', size: 'h-4', labelInside: true });
}