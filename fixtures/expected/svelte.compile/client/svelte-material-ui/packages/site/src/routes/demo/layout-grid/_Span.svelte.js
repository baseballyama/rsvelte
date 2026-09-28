import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LayoutGrid, { Cell } from '@smui/layout-grid';

var root = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 6</div>`);
var root_1 = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 3</div>`);
var root_2 = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 2</div>`);
var root_3 = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 1</div>`);
var root_4 = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 7</div>`);
var root_5 = $.from_html(`<div class="demo-cell svelte-1lcw5a5">Span 5</div>`);
var root_6 = $.from_html(`<div class="demo-cell svelte-1lcw5a5" style="height: 80px;">Span 6 on desktop, 4 on tablet, 2 on phone (always half)</div>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _Span($$anchor) {
	LayoutGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => Array(2), $.index, ($$anchor, _unused) => {
				Cell($$anchor, {
					span: 6,
					children: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.each(node_1, 16, () => Array(4), $.index, ($$anchor, _unused) => {
				Cell($$anchor, {
					span: 3,
					children: ($$anchor, $$slotProps) => {
						var div_1 = root_1();

						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 16, () => Array(6), $.index, ($$anchor, _unused) => {
				Cell($$anchor, {
					span: 2,
					children: ($$anchor, $$slotProps) => {
						var div_2 = root_2();

						$.append($$anchor, div_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 16, () => Array(12), $.index, ($$anchor, _unused) => {
				Cell($$anchor, {
					span: 1,
					children: ($$anchor, $$slotProps) => {
						var div_3 = root_3();

						$.append($$anchor, div_3);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_3, 2);

			Cell(node_4, {
				span: 7,
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_4();

					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Cell(node_5, {
				span: 5,
				children: ($$anchor, $$slotProps) => {
					var div_5 = root_5();

					$.append($$anchor, div_5);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Cell(node_6, {
				spanDevices: { desktop: 6, tablet: 4, phone: 2 },
				children: ($$anchor, $$slotProps) => {
					var div_6 = root_6();

					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}