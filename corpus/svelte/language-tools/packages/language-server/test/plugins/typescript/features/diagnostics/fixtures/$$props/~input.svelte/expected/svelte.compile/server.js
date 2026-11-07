import * as $ from 'svelte/internal/server';
import Props from "./$$props.svelte";

export default function Input($$renderer) {
	Props($$renderer, { class: 'abc' });
}