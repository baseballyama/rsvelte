import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div slot="foo"></div>`);

export default function Input($$anchor) {
	Component($$anchor, {
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});
}