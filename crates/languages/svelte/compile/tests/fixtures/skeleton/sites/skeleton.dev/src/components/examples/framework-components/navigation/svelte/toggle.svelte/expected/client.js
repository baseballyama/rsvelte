import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<span>Resize</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800"><!> <div class="flex justify-center items-center"><pre class="pre"> </pre></div></div>`);

export default function Toggle($$anchor) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	const buttonClasses = 'btn hover:preset-tonal';
	let anchorRail = `${buttonClasses} aspect-square w-full max-w-[84px] flex flex-col items-center gap-0.5`;
	let anchorSidebar = `${buttonClasses} justify-start px-2 w-full`;
	let layoutRail = $.state(true);

	function toggleLayout() {
		$.set(layoutRail, !$.get(layoutRail));
	}

	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $.get(layoutRail) ? 'rail' : 'sidebar');
		let $1 = $.derived(() => $.get(layoutRail) ? '' : 'grid grid-rows-[1fr_auto] gap-4');

		Navigation(node, {
			get layout() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Navigation.Content, ($$anchor, Navigation_Content) => {
					Navigation_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Navigation.Header, ($$anchor, Navigation_Header) => {
								Navigation_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Navigation.Trigger, ($$anchor, Navigation_Trigger) => {
											Navigation_Trigger($$anchor, {
												onclick: toggleLayout,
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_1();
													var node_4 = $.first_child(fragment_3);

													{
														let $0 = $.derived(() => $.get(layoutRail) ? 'size-5' : 'size-4');

														ArrowLeftRightIcon(node_4, {
															get class() {
																return $.get($0);
															}
														});
													}

													var node_5 = $.sibling(node_4, 2);

													{
														var consequent = ($$anchor) => {
															var span = root();

															$.append($$anchor, span);
														};

														$.if(node_5, ($$render) => {
															if (!$.get(layoutRail)) $$render(consequent);
														});
													}

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
								Navigation_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_7 = $.first_child(fragment_4);

										$.each(node_7, 16, () => links, (link) => link, ($$anchor, link) => {
											const Icon = $.derived(() => link.icon);
											var fragment_5 = $.comment();
											var node_8 = $.first_child(fragment_5);

											$.component(node_8, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor) => {
												Navigation_TriggerAnchor($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var node_9 = $.first_child(fragment_6);

														{
															let $0 = $.derived(() => $.get(layoutRail) ? 'size-5' : 'size-4');

															$.component(node_9, () => $.get(Icon), ($$anchor, Icon_1) => {
																Icon_1($$anchor, {
																	get class() {
																		return $.get($0);
																	}
																});
															});
														}

														var node_10 = $.sibling(node_9, 2);

														$.component(node_10, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText) => {
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

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
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
	}

	var div_1 = $.sibling(node, 2);
	var pre = $.child(div_1);
	var text_1 = $.only_child(pre);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, `Layout: ${$.get(layoutRail) ? 'Rail' : 'Sidebar'}`));
	$.append($$anchor, div);
}