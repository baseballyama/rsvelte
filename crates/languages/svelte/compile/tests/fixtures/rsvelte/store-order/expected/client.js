import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
var root = $.from_html(`<!> <!> <p> </p> <!>`, 1);
export default function Store_order($$anchor, $$props) {
	$.push($$props, true);
	const $action = () => $.store_get(action, "$action", $$stores);
	const $a = () => $.store_get(a, "$a", $$stores);
	const $tag = () => $.store_get(tag, "$tag", $$stores);
	const $xs = () => $.store_get(xs, "$xs", $$stores);
	const $c = () => $.store_get(c, "$c", $$stores);
	const $b = () => $.store_get(b, "$b", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const s = ($$anchor) => {
		$.next();
		var text = $.text();
		$.template_effect(() => $.set_text(text, $a()));
		$.append($$anchor, text);
	};
	const a = writable(1);
	const b = writable(2);
	const c = writable(3);
	const tag = writable("div");
	const xs = writable([]);
	const action = writable(() => {});
	var fragment_1 = root();
	var node = $.first_child(fragment_1);
	$.element(node, $tag, false, ($$element, $$anchor) => {
		var text_1 = $.text();
		$.template_effect(() => $.set_text(text_1, $a()));
		$.append($$anchor, text_1);
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 1, $xs, $.index, ($$anchor, x) => {
		$.next();
		var text_2 = $.text();
		$.template_effect(() => $.set_text(text_2, $.get(x)));
		$.append($$anchor, text_2);
	}, ($$anchor) => {
		$.next();
		var text_3 = $.text();
		$.template_effect(() => $.set_text(text_3, $c()));
		$.append($$anchor, text_3);
	});
	var p = $.sibling(node_1, 2);
	var text_4 = $.only_child(p, true);
	$.action(p, ($$node) => $action()?.($$node));
	var node_2 = $.sibling(p, 2);
	s(node_2);
	$.template_effect(() => $.set_text(text_4, $b()));
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}
