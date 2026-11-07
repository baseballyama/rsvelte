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

	$.template_effect(() => {
		$.set_text(text, stores.wStore);
		$.set_text(text_1, stores.rStore);
		$.set_text(text_2, stores.dStore);
		$.set_text(text_3, stores.unionStore);
		$.set_text(text_4, stores.storeLike);
		$.set_text(text_5, stores.stores.w);
	});

	$.append($$anchor, fragment);
	$.pop();
}