import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as MyComponents from './MyComponents';

var root = $.from_html(`contents<div></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Components03_input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => MyComponents.MyComponent, ($$anchor, MyComponents_MyComponent) => {
		MyComponents_MyComponent($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_1 = root();

				$.next();
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	OtherComponents.OtherComponent(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root();

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}