import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-[375px] h-[200px] grid grid-rows-[1fr_auto] border border-surface-200-800"><div class="flex justify-center items-center"><p class="opacity-60">...</p></div> <!></div>`);

export default function Default($$anchor) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	Navigation(node, {
		layout: 'bar',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
				Navigation_Menu($$anchor, {
					class: 'grid grid-cols-4 gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 16, () => links, (link) => link, ($$anchor, link) => {
							const Icon = $.derived(() => link.icon);
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor) => {
								Navigation_TriggerAnchor($$anchor, {
									get href() {
										return link.href;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => $.get(Icon), ($$anchor, Icon_1) => {
											Icon_1($$anchor, { class: 'size-5' });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText) => {
											Navigation_TriggerText($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, link.label));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}