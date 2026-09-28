import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Output($$anchor) {
	{
		const test = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		Component($$anchor, { test, $$slots: { test: true } });
	}
}