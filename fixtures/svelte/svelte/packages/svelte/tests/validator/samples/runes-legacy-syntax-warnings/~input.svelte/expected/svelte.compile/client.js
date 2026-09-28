import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <button>click me</button>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: {
			click: function (...$$args) {
				$$props.foo?.apply(this, $$args);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('click me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		$$events: {
			click: function (...$$args) {
				$$props.foo?.apply(this, $$args);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('click me');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'default', {}, null);

	var node_3 = $.sibling(node_2, 2);

	$.slot(node_3, $$props, 'foo', {}, null);

	var button = $.sibling(node_3, 2);

	$.event('click', button, function (...$$args) {
		$$props.foo?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}