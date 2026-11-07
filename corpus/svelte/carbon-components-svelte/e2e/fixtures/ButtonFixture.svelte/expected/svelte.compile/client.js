import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="click-count"> </p>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ButtonFixture($$anchor) {
	let clickCount = 0;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		'data-testid': 'button-primary',
		$$events: { click: () => clickCount += 1 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		'data-testid': 'button-disabled',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Disabled');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		kind: 'secondary',
		'data-testid': 'button-secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Secondary');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_3 = $.only_child(p);

			$.template_effect(() => $.set_text(text_3, `Clicked: ${clickCount ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if (clickCount > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}