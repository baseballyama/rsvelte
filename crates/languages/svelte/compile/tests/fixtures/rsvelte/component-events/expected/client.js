import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<!> <!>`, 1);
export default function Component_events($$anchor, $$props) {
	let n = $.state(0);
	let h = () => {};
	function f() {
		$.update(n);
	}
	const make = () => () => {};
	var fragment = root();
	var node = $.first_child(fragment);
	var event_handler = $.derived(make);
	C(node, {
		get a() {
			return $.get(n);
		},
		$$events: {
			click: [f, $.once(() => $.update(n))],
			hover: h,
			make: function(...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			},
			bubble: function($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},
			"x-y": f
		}
	});
	var node_1 = $.sibling(node, 2);
	$.component(node_1, () => C, ($$anchor, $$component) => {
		$$component($$anchor, { $$events: { click: f } });
	});
	$.append($$anchor, fragment);
}
