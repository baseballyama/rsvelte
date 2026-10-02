import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const foo = writable(1);

	$.pop();
}