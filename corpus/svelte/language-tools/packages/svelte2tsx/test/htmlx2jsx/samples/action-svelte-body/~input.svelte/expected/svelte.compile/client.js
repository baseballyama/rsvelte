import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.action($.document.body, ($$node) => blink?.($$node));
}