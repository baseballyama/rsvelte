import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";

var root = $.from_svg(`<rect width="1" height="1"></rect>`);
var root_1 = $.from_html(`<div class="rounded-xl border bg-white p-4"><svg viewBox="0 0 21 21" class="size-40 text-black" role="img" aria-label="Connect device QR code" shape-rendering="crispEdges"><rect width="21" height="21" fill="white"></rect><!></svg></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Qr_connect($$anchor) {
	const qrCells = [
		"111111100101101111111",
		"100000101001001000001",
		"101110101111101011101",
		"101110100100001011101",
		"101110101010101011101",
		"100000100111001000001",
		"111111101010101111111",
		"000000001101000000000",
		"101011111001111010110",
		"010100001110010101001",
		"111010111011101111010",
		"001101000101000010101",
		"110111101111010111011",
		"000000001001010001010",
		"111111101101111101001",
		"100000100010001001111",
		"101110101011101110100",
		"101110100110100010011",
		"101110101000111101110",
		"100000101101000011001",
		"111111101011101101111"
	];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardContent(node, {
				class: 'flex justify-center pt-6',
				children: ($$anchor, $$slotProps) => {
					var div = root_1();
					var svg = $.child(div);
					var node_1 = $.sibling($.child(svg));

					$.each(node_1, 17, () => qrCells, $.index, ($$anchor, row, y) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, () => [...$.get(row)], $.index, ($$anchor, cell, x) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									var rect = root();

									$.set_attribute(rect, 'x', x);
									$.set_attribute(rect, 'y', y);
									$.append($$anchor, rect);
								};

								$.if(node_3, ($$render) => {
									if ($.get(cell) === "1") $$render(consequent);
								});
							}

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					});

					$.reset(svg);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardHeader(node_4, {
				class: 'text-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					CardTitle(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Scan to connect your mobile device');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					CardDescription(node_6, {
						class: 'text-balance',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Open the Ledger mobile app and scan this code to link your device.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}