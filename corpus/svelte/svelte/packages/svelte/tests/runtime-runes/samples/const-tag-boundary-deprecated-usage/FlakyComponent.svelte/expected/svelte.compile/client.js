import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function FlakyComponent($$anchor, $$props) {
	$.push($$props, true);

	throw new Error();

	$.pop();
}