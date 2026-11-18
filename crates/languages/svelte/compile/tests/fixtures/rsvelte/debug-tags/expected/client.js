import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <button> </button>`, 1);
export default function Debug_tags($$anchor) {
	let x = $.state(1);
	let y = 2;
	let o = $.proxy({ a: 1 });
	var fragment = root();
	$.template_effect(() => {
		console.log({
			x: $.snapshot($.get(x)),
			y: $.snapshot(y)
		});
		debugger;
	});
	$.template_effect(() => {
		console.log({});
		debugger;
	});
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			$.template_effect(() => {
				console.log({ o: $.snapshot(o) });
				debugger;
			});
		};
		$.if(node, ($$render) => {
			if ($.get(x)) $$render(consequent);
		});
	}
	var button = $.sibling(node, 2);
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, $.get(x)));
	$.delegated("click", button, () => $.update(x));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
