import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<!> <!> <!> <!> <!> <button>+</button> <!>`, 1);
export default function Component_attachments($$anchor, $$props) {
	let x = $.state(1);
	const a = (n) => {};
	var fragment = root();
	var node = $.first_child(fragment);
	C(node, { [$.attachment()]: a });
	var node_1 = $.sibling(node, 2);
	C(node_1, {
		a: 1,
		[$.attachment()]: (n) => console.log(n, $.get(x)),
		get b() {
			return $.get(x);
		},
		[$.attachment()]: a
	});
	var node_2 = $.sibling(node_1, 2);
	$.component(node_2, () => $$props.D, ($$anchor, D_1) => {
		D_1($$anchor, {
			[$.attachment()]: a,
			children: ($$anchor, $$slotProps) => {
				$.next();
				var text = $.text("child");
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});
	var node_3 = $.sibling(node_2, 2);
	$.component(node_3, () => $$props.D, ($$anchor, $$component) => {
		$$component($$anchor, { [$.attachment()]: a });
	});
	var node_4 = $.sibling(node_3, 2);
	{
		var consequent = ($$anchor) => {
			C($$anchor, $.spread_props({ y: 1 }, { [$.attachment()]: a }));
		};
		$.if(node_4, ($$render) => {
			if ($.get(x)) $$render(consequent);
		});
	}
	var button = $.sibling(node_4, 2);
	var node_5 = $.sibling(button, 2);
	C(node_5, {
		[$.attachment()]: ($$node) => (($.get(x) > 1 ? a : null) || $.noop)($$node),
		[$.attachment()]: (n) => a(n, $.get(x))
	});
	$.delegated("click", button, () => $.update(x));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
