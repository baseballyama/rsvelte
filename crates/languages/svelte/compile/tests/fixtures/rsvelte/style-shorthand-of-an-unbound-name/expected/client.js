import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
var root = $.from_html(`<div>x</div> <p>y</p>`, 1);
export default function Style_shorthand_of_an_unbound_name($$anchor, $$props) {
	$.push($$props, true);
	const $store = () => $.store_get(store, "$store", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable("v");
	const color = "red";
	var fragment = root();
	var div = $.first_child(fragment);
	let styles;
	var p = $.sibling(div, 2);
	let styles_1;
	$.template_effect(() => {
		styles = $.set_style(div, "", styles, { $store: $store() });
		styles_1 = $.set_style(p, "", styles_1, {
			color,
			size: $$props.size,
			width
		});
	});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
