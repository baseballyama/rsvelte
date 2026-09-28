import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const text = $.derived(() => $$props.value.toString());

	$.user_effect(() => console.log($.get(text)));
	$.pop();
}