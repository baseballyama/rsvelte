import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "$lib/components/ui/tooltip";
import { Button } from "$lib/components/ui/button";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
import { cn } from "$lib/utils.js";
import { scale } from "svelte/transition";
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import X from "@lucide/svelte/icons/x";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'text',
	'icon',
	'animationDuration',
	'variant',
	'size',
	'onCopy',
	'class'
]);

var root = $.from_html(`<div><!> <span class="sr-only">Copied</span></div>`);
var root_1 = $.from_html(`<div><!> <span class="sr-only">Failed to copy</span></div>`);
var root_2 = $.from_html(`<div><!> <span class="sr-only">Copy</span></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Copy_button($$anchor, $$props) {
	$.push($$props, true);

	// interface Props extends Omit<ButtonProps, "href"> {
	// 	text: string;
	// 	icon?: Snippet<[]>;
	// 	animationDuration?: number;
	// 	onCopy?: (status: UseClipboard["status"]) => void;
	// }
	let animationDuration = $.prop($$props, 'animationDuration', 3, 300),
		variant = $.prop($$props, 'variant', 3, "ghost"),
		size = $.prop($$props, 'size', 3, "icon"),
		restProps = $.rest_props($$props, rest_excludes);

	const clipboard = new UseClipboard({ delay: 1500 });

	TooltipProvider($$anchor, {
		delayDuration: 200,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node = $.first_child(fragment_2);

					TooltipTrigger(node, {
						get class() {
							return $$props.class;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => cn("z-50 h-8 w-8"));

								Button($$anchor, $.spread_props(() => restProps, {
									get variant() {
										return variant();
									},

									get size() {
										return size();
									},

									get class() {
										return $.get($0);
									},
									type: 'button',
									name: 'copy',
									tabindex: -1,
									onclick: async () => {
										const status = await clipboard.copy($$props.text);

										$$props.onCopy?.(status);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_1 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												var div = root();
												var node_2 = $.child(div);

												Check(node_2, { class: 'size-3.5! text-[#10B981]' });
												$.next(2);
												$.reset(div);
												$.transition(1, div, () => scale, () => ({ duration: animationDuration(), start: 0.5 }));
												$.append($$anchor, div);
											};

											var consequent_1 = ($$anchor) => {
												var div_1 = root_1();
												var node_3 = $.child(div_1);

												X(node_3, { class: 'size-3.5!' });
												$.next(2);
												$.reset(div_1);
												$.transition(1, div_1, () => scale, () => ({ duration: animationDuration(), start: 0.5 }));
												$.append($$anchor, div_1);
											};

											var alternate_1 = ($$anchor) => {
												var div_2 = root_2();
												var node_4 = $.child(div_2);

												{
													var consequent_2 = ($$anchor) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.snippet(node_5, () => $$props.icon);
														$.append($$anchor, fragment_5);
													};

													var alternate = ($$anchor) => {
														Copy($$anchor, { class: 'size-3.5! opacity-50' });
													};

													$.if(node_4, ($$render) => {
														if ($$props.icon) $$render(consequent_2); else $$render(alternate, -1);
													});
												}

												$.next(2);
												$.reset(div_2);
												$.transition(1, div_2, () => scale, () => ({ duration: animationDuration(), start: 0.5 }));
												$.append($$anchor, div_2);
											};

											$.if(node_1, ($$render) => {
												if (clipboard.status === "success") $$render(consequent); else if (clipboard.status === "failure") $$render(consequent_1, 1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							}
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node, 2);

					TooltipContent(node_6, {
						align: 'center',
						side: 'top',
						class: 'z-50 px-2 py-1 text-[10px]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy Code');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}