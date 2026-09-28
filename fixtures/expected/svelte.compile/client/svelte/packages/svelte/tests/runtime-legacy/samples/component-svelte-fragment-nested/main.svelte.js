import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>B slot</p>`);

export default function Main($$anchor) {
	Child($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var text = $.text('Default');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			b: ($$anchor, $$slotProps) => {
				var p = root();

				$.append($$anchor, p);
			}
		}
	});
}