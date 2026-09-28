import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Presentation, Slide, Code, Transition, Action } from '$lib/index.js';
import { tween } from '@animotion/motion';

var root = $.from_html(`<p class="text-4xl font-bold drop-shadow-sm">🪄 Use arrow keys to navigate</p>`);
var root_1 = $.from_html(`<p class="text-8xl font-bold drop-shadow-sm">🪄 Animotion</p>`);
var root_2 = $.from_svg(`<svg width="560"><circle></circle><text font-family="Monaspace Neon" text-anchor="middle" dominant-baseline="middle"> </text></svg>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<p class="text-6xl font-bold drop-shadow-sm">🪄 Layout Animations</p>`);
var root_5 = $.from_html(`<div></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<p class="mt-8 text-6xl font-bold">🪄 Animotion</p> <p class="mt-16 text-3xl">Learn more by reading the <a class="underline" href="https://animotion.pages.dev/docs" target="_blank">Animotion docs</a>.</p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let text;
	let code;
	let circle = tween({ x: 0, y: 80, r: 80, fill: '#00ffff' });
	let items = $.state($.proxy([1, 2, 3, 4]));
	let layout = $.state('flex gap-4');

	Presentation($$anchor, {
		options: {
			history: true,
			transition: 'slide',
			controls: true,
			progress: true
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Slide(node, {
				class: 'h-full place-content-center place-items-center',
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Slide(node_1, {
				class: 'h-full place-content-center place-items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_2 = $.first_child(fragment_2);

					Transition(node_2, {
						do: async () => {
							text.classList.replace('text-6xl', 'text-8xl');
							await code.update``;
						},

						children: ($$anchor, $$slotProps) => {
							var p_1 = root_1();

							$.bind_this(p_1, ($$value) => text = $$value, () => text);
							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Transition(node_3, {
						do: async () => {
							text.classList.replace('text-8xl', 'text-6xl');

							await code.update`
					async function animate() {
						// ...
					}
				`;

							await circle.to({ x: 0, fill: '#00ffff' });
						},
						class: 'mt-16 rounded-lg border-t border-t-zinc-800 bg-zinc-900 px-8 py-4',
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

					var node_4 = $.sibling(node_3, 2);

					Transition(node_4, {
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
							var svg = root_2();
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

					var node_5 = $.sibling(node_4, 2);

					Action(node_5, {
						actions: [
							async () => {
								await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
						}
					`;

								await code.selectLines`2`;
								await circle.to({ x: 400, fill: '#ffff00' });
							},

							async () => {
								await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
							await circle.to({ x: 0, fill: '#00ffff' });
						}
					`;

								await code.selectLines`3`;
								await circle.to({ x: 0, fill: '#00ffff' });
							},

							async () => {
								await code.selectLines`*`;

								await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
							await circle.to({ x: 0, fill: '#00ffff' });
						}
					`;

								await circle.to({ x: 0, fill: '#00ffff' });
							}
						]
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			Slide(node_6, {
				class: 'h-full place-content-center place-items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_6();
					var node_7 = $.first_child(fragment_4);

					Transition(node_7, {
						children: ($$anchor, $$slotProps) => {
							var p_2 = root_4();

							$.append($$anchor, p_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Transition(node_8, {
						do: () => {
							$.set(items, [1, 2, 3, 4], true);
							$.set(layout, 'flex gap-4');
						},
						class: 'mt-16',
						children: ($$anchor, $$slotProps) => {
							var div = root_5();

							$.each(div, 22, () => $.get(items), (item) => item, ($$anchor, item, i) => {
								{
									let $0 = $.derived(() => $.get(i) * 0.1);

									Transition($$anchor, {
										class: 'grid h-45 w-45 place-content-center rounded-2xl border-t-2 border-white bg-gray-200 text-6xl font-semibold text-black shadow-2xl',
										entry: 'rotate',
										duration: 2,
										get delay() {
											return $.get($0);
										},
										visible: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, item));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								}
							});

							$.reset(div);
							$.template_effect(() => $.set_class(div, 1, $.clsx($.get(layout))));
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Transition(node_9, {
						transitions: [
							() => {
								$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
								$.set(items, [4, 3, 2, 1], true);
							},

							() => {
								$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
								$.set(items, [2, 1, 4, 3], true);
							},

							() => {
								$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
								$.set(items, [4, 3, 2, 1], true);
							},

							() => {
								$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
								$.set(items, [1, 2, 3, 4], true);
							},
							() => $.set(layout, 'flex gap-4')
						]
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_6, 2);

			Slide(node_10, {
				class: 'h-full place-content-center place-items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_7();

					$.next(2);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}