import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Props from "./$$props.svelte";

export default function Input($$anchor) {
	Props($$anchor, { class: 'abc' });
}