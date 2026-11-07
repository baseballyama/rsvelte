import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Marquee } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="card bg-surface-100-900 flex items-center gap-3 px-6 py-4 whitespace-nowrap"><span class="text-3xl"> </span> <span class="font-medium"> </span></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
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

	Marquee($$anchor, {
		autoFill: true,
		pauseOnInteraction: true,
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

												$.each(node_5, 17, () => items, $.index, ($$anchor, item) => {
													var div = root();
													var span = $.child(div);
													var text = $.only_child(span, true);
													var span_1 = $.sibling(span, 2);
													var text_1 = $.only_child(span_1, true);

													$.reset(div);

													$.template_effect(() => {
														$.set_text(text, $.get(item).emoji);
														$.set_text(text_1, $.get(item).label);
													});

													$.append($$anchor, div);
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

	$.pop();
}