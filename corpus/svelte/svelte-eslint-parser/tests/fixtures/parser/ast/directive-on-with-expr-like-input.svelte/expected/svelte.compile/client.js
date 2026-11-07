import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Directive_on_with_expr_like_input($$anchor, $$props) {
	const foo = { bar: () => alert('foo.bar') };

	Inner($$anchor, {
		$$events: {
			'foo.bar': function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}