import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import Code from '@lucide/svelte/icons/code';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'onclick']);
var root = $.from_html(`<!> <span class="sr-only">View component Details</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);

export default function View_component_button($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Tooltip.TooltipProvider, ($$anchor, Tooltip_TooltipProvider) => {
		Tooltip_TooltipProvider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Tooltip, ($$anchor, Tooltip_Tooltip) => {
					Tooltip_Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_3 = $.first_child(fragment_3);

											Code(node_3, { size: 16, 'aria-hidden': true });
											$.next(2);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_2, () => Tooltip.TooltipTrigger, ($$anchor, Tooltip_TooltipTrigger) => {
									Tooltip_TooltipTrigger($$anchor, $.spread_props(
										{
											get onclick() {
												return $$props.onclick;
											},
											class: 'text-muted-foreground/80 hover:text-foreground hover:bg-transparent',
											'aria-label': 'View component Details'
										},
										() => restProps,
										{ child, $$slots: { child: true } }
									));
								});
							}

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Tooltip.TooltipContent, ($$anchor, Tooltip_TooltipContent) => {
								Tooltip_TooltipContent($$anchor, {
									class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('View component details');

										$.append($$anchor, text);
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
	});

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn($$props.class))]);
	$.append($$anchor, div);
	$.pop();
}