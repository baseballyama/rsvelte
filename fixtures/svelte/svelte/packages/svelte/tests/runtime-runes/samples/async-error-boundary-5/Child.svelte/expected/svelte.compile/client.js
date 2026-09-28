import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	if ($$props.environment === 'client') {
		throw new Error('oops');
	}

	$.pop();
}