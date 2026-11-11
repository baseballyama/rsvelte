import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
var root = $.from_html(`<p> </p><button>x</button>`, 1);
export default function Store_updates($$anchor, $$props) {
	$.push($$props, true);
	const $a = () => $.store_get($.get(a), "$a", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = $.state($.proxy(writable(1)));
	function f() {
		$.store_unsub($.set(a, writable(2), true), "$a", $$stores);
		$.update_store($.get(a), $a());
		$.update_pre_store($.get(a), $a());
		$.store_set($.get(a), $a() - 1);
		$.store_mutate($.get(a), $.untrack($a).x--, $.untrack($a));
	}
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p);
	$.template_effect(() => $.set_text(text, `${$a() ?? ""} ${$.get(a) ?? ""}`));
	$.delegated("click", button, f);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
$.delegate(["click"]);
