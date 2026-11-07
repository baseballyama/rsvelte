import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <div> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let map = new Map();
	let set = new Set();
	let rmap = new SvelteMap();
	let rset = new SvelteSet();
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) => {
			$.set_text(text, `${$0 ?? ''} ${$1 ?? ''} ${$2 ?? ''}`);
			$.set_text(text_1, `${$3 ?? ''} ${$4 ?? ''} ${$5 ?? ''}`);
			$.set_text(text_2, `${$6 ?? ''} ${$7 ?? ''} ${$8 ?? ''}`);
			$.set_text(text_3, `${$9 ?? ''} ${$10 ?? ''} ${$11 ?? ''}`);
		},
		[
			() => rset.entries(),
			() => rset.keys(),
			() => rset.values(),
			() => set.entries(),
			() => set.keys(),
			() => set.values(),
			() => rmap.entries(),
			() => rmap.keys(),
			() => rmap.values(),
			() => map.entries(),
			() => map.keys(),
			() => map.values()
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}