import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from "./Component.svelte";

var root = $.from_html(`<div slot="cool:stuff">cool</div>`);
var root_1 = $.from_html(`<div slot="cool stuff">cool</div>`);
var root_2 = $.from_html(`<div slot="new">reserved keyword</div>`);
var root_3 = $.from_html(`<div slot="stuff">cool</div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	Comp(node, {
		$$slots: {
			'cool:stuff': ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Comp(node_1, {
		$$slots: {
			'cool stuff': ($$anchor, $$slotProps) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Comp(node_2, {
		$$slots: {
			new: ($$anchor, $$slotProps) => {
				var div_2 = root_2();

				$.append($$anchor, div_2);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Comp(node_3, {
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				var div_3 = root_3();

				$.append($$anchor, div_3);
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Comp(node_4, {
		$$slots: {
			'cool:stuff': ($$anchor, $$slotProps) => {
				var text = $.text('cool');

				$.append($$anchor, text);
			}
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Comp(node_5, {
		$$slots: {
			'cool stuff': ($$anchor, $$slotProps) => {
				var text_1 = $.text('cool');

				$.append($$anchor, text_1);
			}
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Comp(node_6, {
		$$slots: {
			stuff: ($$anchor, $$slotProps) => {
				var text_2 = $.text('cool');

				$.append($$anchor, text_2);
			}
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Comp(node_7, {
		$$slots: {
			'cool:stuff': ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var div_4 = root();

				$.append($$anchor, div_4);
			}
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Comp(node_8, {
		$$slots: {
			'cool stuff': ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var div_5 = root_1();

				$.append($$anchor, div_5);
			}
		}
	});

	var node_9 = $.sibling(node_8, 2);

	Comp(node_9, {
		$$slots: {
			'cool:stuff': ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var text_3 = $.text('cool');

				$.append($$anchor, text_3);
			}
		}
	});

	var node_10 = $.sibling(node_9, 2);

	Comp(node_10, {
		$$slots: {
			'cool stuff': ($$anchor, $$slotProps) => {
				const should_stay = $.derived(() => $$slotProps.should_stay);
				var text_4 = $.text('cool');

				$.append($$anchor, text_4);
			}
		}
	});

	$.append($$anchor, fragment);
}