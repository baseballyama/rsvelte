import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LayoutGrid, { Cell, InnerGrid } from '@smui/layout-grid';

var root = $.from_html(`<div class="demo-cell svelte-6ibw1k"></div>`);

export default function _Nested($$anchor) {
	LayoutGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => Array(9), $.index, ($$anchor, _unused, i) => {
				Cell($$anchor, {
					children: ($$anchor, $$slotProps) => {
						InnerGrid($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_1 = $.first_child(fragment_4);

								$.each(node_1, 16, () => Array(3), $.index, ($$anchor, _unused, j, $$array) => {
									Cell($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div = root();

											div.textContent = `Cell ${i + 1}, ${j + 1}`;
											$.append($$anchor, div);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}