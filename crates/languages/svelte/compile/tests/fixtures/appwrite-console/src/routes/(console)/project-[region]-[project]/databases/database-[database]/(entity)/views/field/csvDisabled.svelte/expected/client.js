import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div slot="tooltip">This action is disabled during import.</div>`);

export default function CsvDisabled($$anchor, $$props) {
	Tooltip($$anchor, {
		maxWidth: '12rem',
		portal: true,
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.snippet(node, () => $$props.children);
			$.reset(div);
			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			tooltip: ($$anchor, $$slotProps) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			}
		}
	});
}