import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Marquee } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="card bg-surface-100-900 flex items-center gap-3 px-6 py-4 whitespace-nowrap"><span class="text-3xl"> </span> <span class="font-medium"> </span></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-10"><header><h1 class="h1">Marquee</h1></header> <section class="space-y-4"><h2 class="h2">Default</h2> <!></section></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ emoji: '🐉', label: 'Dragon' },
		{ emoji: '🧙', label: 'Wizard' },
		{ emoji: '⚔️', label: 'Knight' },
		{ emoji: '💀', label: 'Skeleton' },
		{ emoji: '🏰', label: 'Castle' },
		{ emoji: '🧝', label: 'Elf' },
		{ emoji: '🗡️', label: 'Rogue' },
		{ emoji: '🛡️', label: 'Paladin' }
	];

	var div = root_2();
	var section = $.sibling($.child(div), 2);
	var node = $.sibling($.child(section), 2);

	Marquee(node, {
		autoFill: true,
		pauseOnInteraction: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Marquee.Edge, ($$anchor, Marquee_Edge) => {
				Marquee_Edge($$anchor, { side: 'start' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Marquee.Viewport, ($$anchor, Marquee_Viewport) => {
				Marquee_Viewport($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						{
							const children = ($$anchor, marquee = $.noop) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.each(node_4, 17, () => Array.from({ length: marquee()().contentCount }), $.index, ($$anchor, _, index) => {
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									$.component(node_5, () => Marquee.Content, ($$anchor, Marquee_Content) => {
										Marquee_Content($$anchor, {
											index,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_6 = $.first_child(fragment_4);

												$.each(node_6, 17, () => items, $.index, ($$anchor, item) => {
													var div_1 = root();
													var span = $.child(div_1);
													var text = $.only_child(span, true);
													var span_1 = $.sibling(span, 2);
													var text_1 = $.only_child(span_1, true);

													$.reset(div_1);

													$.template_effect(() => {
														$.set_text(text, $.get(item).emoji);
														$.set_text(text_1, $.get(item).label);
													});

													$.append($$anchor, div_1);
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								});

								$.append($$anchor, fragment_2);
							};

							$.component(node_3, () => Marquee.Context, ($$anchor, Marquee_Context) => {
								Marquee_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_2, 2);

			$.component(node_7, () => Marquee.Edge, ($$anchor, Marquee_Edge_1) => {
				Marquee_Edge_1($$anchor, { side: 'end' });
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}