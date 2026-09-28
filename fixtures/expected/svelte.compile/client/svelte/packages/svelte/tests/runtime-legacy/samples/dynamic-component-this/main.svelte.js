import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

export default function Main($$anchor) {
	let div;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Test, ($$anchor, $$component) => {
		$$component($$anchor, {
			get div() {
				return div;
			},

			set div($$value) {
				div = $$value;
			}
		});
	});

	$.append($$anchor, fragment);
}