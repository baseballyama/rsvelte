import * as $ from 'svelte/internal/server';
import { derived } from 'svelte/store';

export default function Input($$renderer) {
	let a = $.derived(() => 1);
}