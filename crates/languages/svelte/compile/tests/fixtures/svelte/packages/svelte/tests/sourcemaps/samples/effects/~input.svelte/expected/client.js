import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		foo;
	});

	$.user_pre_effect(() => {
		bar;
	});

	$.pop();
}