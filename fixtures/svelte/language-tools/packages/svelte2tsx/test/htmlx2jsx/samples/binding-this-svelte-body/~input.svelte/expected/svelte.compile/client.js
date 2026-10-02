import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.bind_this($.document.body, ($$value) => element = $$value, () => element);
}