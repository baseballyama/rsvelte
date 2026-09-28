import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Parent($$anchor, $$props) {
	let test = $.prop($$props, 'test', 7);

	Child($$anchor, {
		get test() {
			return test();
		},

		set test($$value) {
			test($$value);
		}
	});
}