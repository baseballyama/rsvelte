import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Item from './Item.svelte';

var root = $.from_html(` <ul></ul>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let n = $.prop($$props, 'n', 3, 0);

	function logRender() {
		console.log(`parent: render ${n()}`);

		return 'parent';
	}

	$.user_effect(() => {
		console.log(`parent: $effect ${n()}`);
	});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var ul = $.sibling(text);

	$.each(ul, 20, () => [1, 2, 3], $.index, ($$anchor, index) => {
		Item($$anchor, {
			get index() {
				return index;
			},

			get n() {
				return n();
			}
		});
	});

	$.reset(ul);
	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} `), [() => logRender()]);
	$.append($$anchor, fragment);
	$.pop();
}