import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from "./Component.svelte";

var root = $.from_html(`<div slot="stuff">cool</div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Comp(node, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Comp(node_1, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				var text = $.text('cool');

				$.append($$anchor, text);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Comp(node_2, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var div_1 = root();

				$.append($$anchor, div_1);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Comp(node_3, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var text_1 = $.text('cool');

				$.append($$anchor, text_1);
			}
		}
	});

	$.append($$anchor, fragment);
}