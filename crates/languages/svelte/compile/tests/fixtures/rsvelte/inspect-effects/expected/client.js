import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p>`);
export default function Inspect_effects($$anchor, $$props) {
	$.push($$props, true);
	let a = 1;
	let b = $.derived(() => a * 2);
	;
	;
	;
	;
	;
	;
	function f() {
		return a;
	}
	$.user_effect(() => {
		console.log(a);
	});
	let d = $.derived(() => {
		return a;
	});
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			const c = $.derived(() => a);
			var p = root();
			p.textContent = $.get(c);
			$.append($$anchor, p);
		};
		$.if(node, ($$render) => {
			if (a) $$render(consequent);
		});
	}
	$.append($$anchor, fragment);
	$.pop();
}
