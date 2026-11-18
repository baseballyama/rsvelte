import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Effect_root_snapshot($$anchor, $$props) {
	$.push($$props, true);
	let items = $.proxy([1, 2]);
	const cleanup = $.effect_root(() => {
		$.user_effect(() => {
			console.log($.snapshot(items));
		});
		return () => {};
	});
	$.effect_root(() => {});
	function copy() {
		return $.snapshot(items);
	}
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(($0) => $.set_text(text, $0), [() => copy().length]);
	$.delegated("click", button, () => console.log(copy(), cleanup));
	$.append($$anchor, button);
	$.pop();
}
$.delegate(["click"]);
