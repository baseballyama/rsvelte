import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <div this-is="wrong"></div>`, 1);
export default function Check_generated_names($$anchor) {
	const Foo = null;
	var fragment = root();
	var node = $.first_child(fragment);
	Foo(node, {
		a: 1,
		children: ($$anchor, $$slotProps) => {
			$.next();
			var text = $.text("x");
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
	$.next(2);
	$.append($$anchor, fragment);
}
