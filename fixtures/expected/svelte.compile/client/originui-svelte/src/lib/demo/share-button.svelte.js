import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import Share from '@lucide/svelte/icons/share-2';
import { page } from '$app/state';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'component']);
var root = $.from_html(`<!> <span class="sr-only"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Share_button($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	async function shareComponent() {
		const shareData = {
			text: `Check out the ${$$props.component.name} component from Origin UI - Svelte`,
			title: `Origin UI - Svelte - ${$$props.component.name}`,
			url: page.url.href
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareData.url);
			}
		} catch(err) {
			console.error('Error sharing:', err);
		}
	}

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
											var node_3 = $.first_child(fragment_4);

											Share(node_3, { size: 16, 'aria-hidden': true });

											var span = $.sibling(node_3, 2);
											var text = $.only_child(span);

											$.template_effect(() => $.set_text(text, `Share the $${$$props.component.name ?? ''} component`));
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_2, () => Tooltip.TooltipTrigger, ($$anchor, Tooltip_TooltipTrigger) => {
									Tooltip_TooltipTrigger($$anchor, $.spread_props({ onclick: shareComponent }, () => restProps, { child, $$slots: { child: true } }));
								});
							}

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Tooltip.TooltipContent, ($$anchor, Tooltip_TooltipContent) => {
								Tooltip_TooltipContent($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `Share the ${$$props.component.name ?? ''} component`));
										$.append($$anchor, text_1);
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