import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Code, Transition, Action } from '$lib/index.js';
import { tween } from '@animotion/motion';

var root = $.from_html(`<p class="text-8xl font-bold drop-shadow-sm">🪄 Animotion</p>`);
var root_1 = $.from_svg(`<svg width="560"><circle></circle><text font-family="Monaspace Neon" text-anchor="middle" dominant-baseline="middle"> </text></svg>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Slide($$anchor, $$props) {
	$.push($$props, true);

	let text;
	let code;
	let circle = tween({ x: 0, y: 80, r: 80, fill: '#00ffff' });
	var fragment = root_2();
	var node = $.first_child(fragment);

	Transition(node, {
		do: async () => {
			text.classList.replace('text-6xl', 'text-8xl');
			await code.update``;
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.bind_this(p, ($$value) => text = $$value, () => text);
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Transition(node_1, {
		do: async () => {
			text.classList.replace('text-8xl', 'text-6xl');

			await code.update`
					async function animate() {
						// ...
					}
				`;

			await circle.to({ x: 0, fill: '#00ffff' });
		},
		class: 'mt-16',
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Code($$anchor, {
					lang: 'ts',
					theme: 'poimandres',
					code: ``,
					options: { duration: 600, stagger: 0.3, containerStyle: false }
				}),
				($$value) => code = $$value,
				() => code
			);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Transition(node_2, {
		do: async () => {
			await code.update`
					async function animate() {
						// ...
					}
				`;

			await circle.to({ x: 0, fill: '#00ffff' });
		},
		class: 'mt-16',
		children: ($$anchor, $$slotProps) => {
			var svg = root_1();
			var circle_1 = $.child(svg);
			var text_1 = $.sibling(circle_1);
			var text_2 = $.only_child(text_1, true);

			$.reset(svg);

			$.template_effect(
				($0) => {
					$.set_attribute(svg, 'height', circle.r * 2);
					$.set_attribute(svg, 'viewBox', `-80 0 560 ${circle.r * 2}`);
					$.set_attribute(circle_1, 'cx', circle.x);
					$.set_attribute(circle_1, 'cy', circle.y);
					$.set_attribute(circle_1, 'r', circle.r);
					$.set_attribute(circle_1, 'fill', circle.fill);
					$.set_attribute(text_1, 'x', circle.x);
					$.set_attribute(text_1, 'y', circle.y);
					$.set_attribute(text_1, 'font-size', circle.r * 0.4);
					$.set_text(text_2, $0);
				},
				[() => circle.x.toFixed(0)]
			);

			$.append($$anchor, svg);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Action(node_3, {
		actions: [
			async () => {
				await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' })
						}
					`;

				await code.selectLines`2`;
				await circle.to({ x: 400, fill: '#ffff00' });
			},

			async () => {
				await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' })
							await circle.to({ x: 0, fill: '#00ffff' })
						}
					`;

				await code.selectLines`3`;
				await circle.to({ x: 0, fill: '#00ffff' });
			},

			async () => {
				await code.selectLines`*`;

				await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' })
							await circle.to({ x: 0, fill: '#00ffff' })
						}
					`;

				await circle.to({ x: 0, fill: '#00ffff' });
			}
		]
	});

	$.append($$anchor, fragment);
	$.pop();
}