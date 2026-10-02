import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

export default function Default($$anchor) {
	Progressbar($$anchor, { progress: '50' });
}