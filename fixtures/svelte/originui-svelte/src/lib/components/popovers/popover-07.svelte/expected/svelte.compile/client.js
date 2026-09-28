import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '../ui/input.svelte';
import Button from '$lib/components/ui/button.svelte';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import RiCodeFill from '~icons/ri/code-fill';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiMailLine from '~icons/ri/mail-line';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';
import { cn } from '$lib/utils';

var root = $.from_html(`<button class="text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed"><div><!></div> <div><!></div></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3 text-center"><div class="text-sm font-medium">Share code</div> <div class="flex flex-wrap justify-center gap-2"><!> <!> <!> <!></div> <div class="space-y-2"><div class="relative"><!> <!></div></div></div>`);
var root_3 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Popover_07($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.state(false);
	let inputRef = $.state(null);

	function handleCopy() {
		if (!$.get(inputRef)) return;

		navigator.clipboard.writeText($.get(inputRef).value);
		$.set(copied, true);
		setTimeout(() => $.set(copied, false), 1500);
	}

	var div = root_3();
	var node = $.child(div);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Share');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			PopoverContent(node_2, {
				class: 'w-72',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();
					var div_2 = $.sibling($.child(div_1), 2);
					var node_3 = $.child(div_2);

					Button(node_3, {
						size: 'icon',
						variant: 'outline',
						'aria-label': 'Embed',
						children: ($$anchor, $$slotProps) => {
							RiCodeFill($$anchor, { class: 'size-4', 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						size: 'icon',
						variant: 'outline',
						'aria-label': 'Share on Twitter',
						children: ($$anchor, $$slotProps) => {
							RiTwitterXFill($$anchor, { class: 'size-4', 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						size: 'icon',
						variant: 'outline',
						'aria-label': 'Share on Facebook',
						children: ($$anchor, $$slotProps) => {
							RiFacebookFill($$anchor, { class: 'size-4', 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						size: 'icon',
						variant: 'outline',
						'aria-label': 'Share via email',
						children: ($$anchor, $$slotProps) => {
							RiMailLine($$anchor, { class: 'size-4', 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.child(div_3);
					var node_7 = $.child(div_4);

					Input(node_7, {
						id: 'input-53',
						class: 'pe-9',
						type: 'text',
						value: 'https://originui-svelte.pages.dev/',
						'aria-label': 'Share link',
						readonly: true,
						get ref() {
							return $.get(inputRef);
						},

						set ref($$value) {
							$.set(inputRef, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					TooltipProvider(node_8, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							Tooltip($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_9 = $.first_child(fragment_7);

									{
										const child = ($$anchor) => {
											var button = root();
											var div_5 = $.child(button);
											var node_10 = $.child(div_5);

											Check(node_10, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
											$.reset(div_5);

											var div_6 = $.sibling(div_5, 2);
											var node_11 = $.child(div_6);

											Copy(node_11, { size: 16, 'aria-hidden': 'true' });
											$.reset(div_6);
											$.reset(button);

											$.template_effect(
												($0, $1) => {
													$.set_attribute(button, 'aria-label', $.get(copied) ? 'Copied' : 'Copy to clipboard');
													button.disabled = $.get(copied);
													$.set_class(div_5, 1, $0);
													$.set_class(div_6, 1, $1);
												},
												[
													() => $.clsx(cn('transition-all', $.get(copied) ? 'scale-100 opacity-100' : 'scale-0 opacity-0')),
													() => $.clsx(cn('absolute transition-all', $.get(copied) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'))
												]
											);

											$.delegated('click', button, handleCopy);
											$.append($$anchor, button);
										};

										TooltipTrigger(node_9, { child, $$slots: { child: true } });
									}

									var node_12 = $.sibling(node_9, 2);

									TooltipContent(node_12, {
										class: 'px-2 py-1 text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Copy to clipboard');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.reset(div_3);
					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);