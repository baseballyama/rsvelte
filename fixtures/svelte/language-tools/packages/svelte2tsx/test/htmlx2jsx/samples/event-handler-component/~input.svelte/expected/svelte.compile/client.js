import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	Component($$anchor, {
		$$events: { event: () => click(), UpperCaseEvent: () => log('hi') }
	});
}