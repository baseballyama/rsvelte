import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
var root = $.from_html(`<b></b><i></i><s></s><u> </u><span> </span><em></em><q></q>`, 1);
export default function Ambient_and_hoisted_names_are_not_known($$anchor, $$props) {
	let p = $.rest_props($$props, rest_excludes);
	if (p) {
		var real = "x";
		{
			var deep = 1;
		}
	}
	var top = "t";
	var fragment = root();
	var b = $.first_child(fragment);
	b.textContent = f();
	var i = $.sibling(b);
	i.textContent = C;
	var s = $.sibling(i);
	s.textContent = v;
	var u = $.sibling(s);
	var text = $.only_child(u, true);
	var span = $.sibling(u);
	var text_1 = $.only_child(span, true);
	var em = $.sibling(span);
	em.textContent = "t";
	var q = $.sibling(em);
	q.textContent = typeof injected;
	$.template_effect(() => {
		$.set_text(text, real);
		$.set_text(text_1, deep);
	});
	$.append($$anchor, fragment);
}
