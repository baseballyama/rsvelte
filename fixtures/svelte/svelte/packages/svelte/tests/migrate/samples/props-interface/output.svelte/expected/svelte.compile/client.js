import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	/** foo */
	/** should not create a prop */
	let foo = $.prop($$props, 'foo', 15),
		bar = $.prop($$props, 'bar', 3, true);

	foo('');
	$.pop();
}