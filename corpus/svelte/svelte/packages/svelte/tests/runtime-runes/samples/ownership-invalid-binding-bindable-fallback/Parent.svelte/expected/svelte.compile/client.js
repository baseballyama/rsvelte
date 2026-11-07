import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Parent($$anchor, $$props) {
	$.push($$props, true);

	let test = $.prop($$props, 'test', 31, () => $.proxy({}));

	Child($$anchor, {
		get test() {
			return test();
		},

		set test($$value) {
			test($$value);
		}
	});

	$.pop();
}