import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { wStore, rStore, dStore, unionStore, storeLike, stores } from '../../ts/store';
import { get } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Ts_test01_input($$anchor, $$props) {
	$.push($$props, true);

	const $wStore = () => $.store_get(wStore, '$wStore', $$stores);
	const $rStore = () => $.store_get(rStore, '$rStore', $$stores);
	const $dStore = () => $.store_get(dStore, '$dStore', $$stores);
	const $unionStore = () => $.store_get(unionStore, '$unionStore', $$stores);
	const $storeLike = () => $.store_get(storeLike, '$storeLike', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	var p_6 = $.sibling(p_5, 2);
	var text_6 = $.only_child(p_6, true);
	var p_7 = $.sibling(p_6, 2);
	var text_7 = $.only_child(p_7, true);
	var p_8 = $.sibling(p_7, 2);
	var text_8 = $.only_child(p_8, true);
	var p_9 = $.sibling(p_8, 2);
	var text_9 = $.only_child(p_9, true);
	var p_10 = $.sibling(p_9, 2);
	var text_10 = $.only_child(p_10, true);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_text(text, $wStore());
			$.set_text(text_1, $0);
			$.set_text(text_2, $rStore());
			$.set_text(text_3, $1);
			$.set_text(text_4, $dStore());
			$.set_text(text_5, $2);
			$.set_text(text_6, $unionStore());
			$.set_text(text_7, $3);
			$.set_text(text_8, $storeLike());
			$.set_text(text_9, $4);
			$.set_text(text_10, $5);
		},
		[
			() => get(wStore),
			() => get(rStore),
			() => get(dStore),
			() => get(unionStore),
			() => get(storeLike),
			() => get(stores.w)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}