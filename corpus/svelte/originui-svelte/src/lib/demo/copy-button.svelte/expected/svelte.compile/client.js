import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'code']);
var root = $.from_html(`<div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true"><path fill="#10B981" d="M14.548 3.488a.75.75 0 0 1-.036 1.06l-8.572 8a.75.75 0 0 1-1.023 0l-3.429-3.2a.75.75 0 0 1 1.024-1.096l2.917 2.722 8.06-7.522a.75.75 0 0 1 1.06.036Z"></path></svg></div> <div><svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 2.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5ZM10 1H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm3 5.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5v-1H5v1a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1v1.5Z"></path></svg></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Copy_button($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let copied = $.state(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText($$props.code);
			$.set(copied, true);
			setTimeout(() => $.set(copied, false), 1500);
		} catch(err) {
			console.error('Failed to copy text: ', err);
		}
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.TooltipProvider, ($$anchor, Tooltip_TooltipProvider) => {
		Tooltip_TooltipProvider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Tooltip, ($$anchor, Tooltip_Tooltip) => {
					Tooltip_Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var div = $.first_child(fragment_4);
											var div_1 = $.sibling(div, 2);

											$.template_effect(
												($0, $1) => {
													$.set_class(div, 1, $0);
													$.set_class(div_1, 1, $1);
												},
												[
													() => $.clsx(cn('transition-all', $.get(copied) ? 'scale-100 opacity-100' : 'scale-0 opacity-0')),
													() => $.clsx(cn('absolute transition-all', $.get(copied) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'))
												]
											);

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									}));
								};

								let $0 = $.derived(() => cn('text-muted-foreground/80 hover:text-foreground hover:bg-transparent disabled:opacity-100', $$props.class));
								let $1 = $.derived(() => $.get(copied) ? 'Copied' : 'Copy component source');

								$.component(node_2, () => Tooltip.TooltipTrigger, ($$anchor, Tooltip_TooltipTrigger) => {
									Tooltip_TooltipTrigger($$anchor, $.spread_props(
										{
											onclick: handleCopy,
											get class() {
												return $.get($0);
											},

											get 'aria-label'() {
												return $.get($1);
											},

											get disabled() {
												return $.get(copied);
											}
										},
										() => restProps,
										{ child, $$slots: { child: true } }
									));
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.TooltipContent, ($$anchor, Tooltip_TooltipContent) => {
								Tooltip_TooltipContent($$anchor, {
									class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Copy');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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
	$.pop();
}