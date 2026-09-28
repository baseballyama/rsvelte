import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LayoutGrid, { Cell } from '@smui/layout-grid';

var root = $.from_html(`<div class="demo-cell svelte-1czuk4r"></div>`);

export default function _Simple($$anchor) {
	LayoutGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => Array(9), $.index, ($$anchor, _unused, i) => {
				Cell($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div = root();

						div.textContent = `Cell ${i + 1}`;
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}