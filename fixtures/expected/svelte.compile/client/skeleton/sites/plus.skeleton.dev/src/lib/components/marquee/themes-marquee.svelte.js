import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { themes } from './themes.js';
import { Marquee } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="card ring ring-inset ring-surface-950-50/10 flex items-center gap-2 px-4 py-2 whitespace-nowrap"><span> </span> <span class="text-sm font-medium"> </span> <div class="flex gap-1"><span class="size-3 rounded-full"></span> <span class="size-3 rounded-full"></span> <span class="size-3 rounded-full"></span></div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-3 py-4 overflow-hidden"></div>`);

export default function Themes_marquee($$anchor, $$props) {
	$.push($$props, true);

	function shuffle(arr) {
		const result = [...arr];

		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));

			[result[i], result[j]] = [result[j], result[i]];
		}

		return result;
	}

	const rows = [1, 2, 3, 4].map(() => shuffle(themes));
	var div = root_2();

	$.each(div, 21, () => rows, $.index, ($$anchor, row, i) => {
		Marquee($$anchor, {
			reverse: i % 2 === 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.component(node, () => Marquee.Edge, ($$anchor, Marquee_Edge) => {
					Marquee_Edge($$anchor, { side: 'start' });
				});

				var node_1 = $.sibling(node, 2);

				$.component(node_1, () => Marquee.Viewport, ($$anchor, Marquee_Viewport) => {
					Marquee_Viewport($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								const children = ($$anchor, marquee = $.noop) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.each(node_3, 17, () => Array.from({ length: marquee()().contentCount }), $.index, ($$anchor, _, index) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Marquee.Content, ($$anchor, Marquee_Content) => {
											Marquee_Content($$anchor, {
												index,
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.each(node_5, 17, () => $.get(row), $.index, ($$anchor, theme) => {
														var div_1 = root();
														var span = $.child(div_1);
														var text = $.only_child(span, true);
														var span_1 = $.sibling(span, 2);
														var text_1 = $.only_child(span_1, true);
														var div_2 = $.sibling(span_1, 2);
														var span_2 = $.child(div_2);
														var span_3 = $.sibling(span_2, 2);
														var span_4 = $.sibling(span_3, 2);

														$.reset(div_2);
														$.reset(div_1);

														$.template_effect(() => {
															$.set_style(div_1, `background-color: light-dark(${$.get(theme).surface50 ?? ''}, ${$.get(theme).surface950 ?? ''});`);
															$.set_text(text, $.get(theme).emoji);
															$.set_text(text_1, $.get(theme).name);
															$.set_style(span_2, `background-color: ${$.get(theme).primary500 ?? ''};`);
															$.set_style(span_3, `background-color: ${$.get(theme).secondary500 ?? ''};`);
															$.set_style(span_4, `background-color: ${$.get(theme).tertiary500 ?? ''};`);
														});

														$.append($$anchor, div_1);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								};

								$.component(node_2, () => Marquee.Context, ($$anchor, Marquee_Context) => {
									Marquee_Context($$anchor, { children, $$slots: { default: true } });
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Marquee.Edge, ($$anchor, Marquee_Edge_1) => {
					Marquee_Edge_1($$anchor, { side: 'end' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}