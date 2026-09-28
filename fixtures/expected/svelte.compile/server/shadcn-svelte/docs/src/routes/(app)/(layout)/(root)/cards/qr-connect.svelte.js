import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";

export default function Qr_connect($$renderer) {
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

	Card($$renderer, {
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: 'flex justify-center pt-6',
				children: ($$renderer) => {
					$$renderer.push(`<div class="rounded-xl border bg-white p-4"><svg viewBox="0 0 21 21" class="size-40 text-black" role="img" aria-label="Connect device QR code" shape-rendering="crispEdges"><rect width="21" height="21" fill="white"></rect><!--[-->`);

					const each_array = $.ensure_array_like(qrCells);

					for (let y = 0, $$length = each_array.length; y < $$length; y++) {
						let row = each_array[y];

						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like([...row]);

						for (let x = 0, $$length = each_array_1.length; x < $$length; x++) {
							let cell = each_array_1[x];

							if (cell === "1") {
								$$renderer.push(`<!--[0--><rect${$.attr('x', x)}${$.attr('y', y)} width="1" height="1"></rect>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></svg></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardHeader($$renderer, {
				class: 'text-center',
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Scan to connect your mobile device`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						class: 'text-balance',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open the Ledger mobile app and scan this code to link your device.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}