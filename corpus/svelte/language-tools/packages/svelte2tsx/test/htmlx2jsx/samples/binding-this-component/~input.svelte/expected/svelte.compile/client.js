import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.bind_this(Component($$anchor, { type: 'radio', value: 'Plain' }), ($$value) => element = $$value, () => element);
}