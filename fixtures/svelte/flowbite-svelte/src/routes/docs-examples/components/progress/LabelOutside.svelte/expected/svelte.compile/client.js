import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

export default function LabelOutside($$anchor) {
	Progressbar($$anchor, { progress: '50', labelOutside: 'flowbite-svelte' });
}