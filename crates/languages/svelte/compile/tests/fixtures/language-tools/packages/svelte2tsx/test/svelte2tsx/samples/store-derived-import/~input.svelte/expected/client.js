import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { derived } from 'svelte/store';

export default function Input($$anchor) {
	let a = $.derived(() => 1);
}