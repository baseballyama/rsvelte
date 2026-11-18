import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
import Child from "./Child.svelte";
var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<input/> <input/> <!> <!> <button>x</button>`, 1);
export default function Store_bindings($$anchor, $$props) {
	$.push($$props, true);
	const $count = () => $.store_get(count, "$count", $$stores);
	const $obj = () => $.store_get(obj, "$obj", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	const obj = writable({
		a: 1,
		list: [{ v: 1 }]
	});
	var fragment = root_1();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	var node = $.sibling(input_1, 2);
	Child(node, {
		get value() {
			$.mark_store_binding();
			return $count();
		},
		set value($$value) {
			$.store_set(count, $$value);
		},
		get other() {
			return $obj().a;
		},
		set other($$value) {
			$.store_mutate(obj, $.untrack($obj).a = $$value, $.untrack($obj));
		}
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 1, () => $obj().list, $.index, ($$anchor, item, $$index) => {
		var input_2 = root();
		$.remove_input_defaults(input_2);
		$.bind_value(input_2, () => $.get(item).v, ($$value) => ($.get(item).v = $$value, $.invalidate_store($$stores, "$obj")));
		$.append($$anchor, input_2);
	});
	var button = $.sibling(node_1, 2);
	$.bind_value(input, $count, ($$value) => $.store_set(count, $$value));
	$.bind_value(input_1, () => $obj().a, ($$value) => $.store_mutate(obj, $.untrack($obj).a = $$value, $.untrack($obj)));
	$.delegated("click", button, () => {
		$.store_mutate(obj, $.untrack($obj).a++, $.untrack($obj));
		$.update_store(count, $count(), -1);
		$.update_pre_store(count, $count());
	});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
$.delegate(["click"]);
