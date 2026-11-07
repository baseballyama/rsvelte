import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let online;

	$.bind_online(($$value) => online = $$value);
}