import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div slot="test"></div>`);

export default function Input($$anchor) {
	Component($$anchor, {
		$$slots: {
			test: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});
}