import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LayoutGrid, { Cell } from '@smui/layout-grid';

var root = $.from_html(`<div class="demo-cell svelte-ile528" style="height: 120px;">Tall Cell</div>`);
var root_1 = $.from_html(`<div class="demo-cell svelte-ile528">Align Top</div>`);
var root_2 = $.from_html(`<div class="demo-cell svelte-ile528">Align Middle</div>`);
var root_3 = $.from_html(`<div class="demo-cell svelte-ile528">Align Bottom</div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _Align($$anchor) {
	LayoutGrid($$anchor, {
		align: 'right',
		style: 'border: 1px solid var(--mdc-theme-secondary, #333);',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			Cell(node, {
				span: 1,
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Cell(node_1, {
				align: 'top',
				span: 1,
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Cell(node_2, {
				align: 'middle',
				span: 1,
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_2();

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Cell(node_3, {
				align: 'bottom',
				span: 1,
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_3();

					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}