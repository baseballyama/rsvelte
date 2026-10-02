import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as stores from '../../ts/store';
import { get } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Ts_stores01_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4, true);
	var p_5 = $.sibling(p_4, 2);
	var text_5 = $.only_child(p_5, true);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);
			$.set_text(text_5, $5);
		},
		[
			() => get(stores.wStore),
			() => get(stores.rStore),
			() => get(stores.dStore),
			() => get(stores.unionStore),
			() => get(stores.storeLike),
			() => get(stores.stores.w)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}