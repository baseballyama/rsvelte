import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import CheckIcon from '@lucide/svelte/icons/check';
import CopyIcon from '@lucide/svelte/icons/copy';

var root = $.from_html(`<div><!></div> <div><!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_28($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.state(false);

	function handleCopy() {
		$.set(copied, true);
		setTimeout(() => $.set(copied, false), 1500);
	}

	TooltipProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var div = $.first_child(fragment_4);
									var node_1 = $.child(div);

									CheckIcon(node_1, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
									$.reset(div);

									var div_1 = $.sibling(div, 2);
									var node_2 = $.child(div_1);

									CopyIcon(node_2, { size: 16, 'aria-hidden': 'true' });
									$.reset(div_1);

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

						let $0 = $.derived(() => $.get(copied) ? 'Copied' : 'Copy component source');

						TooltipTrigger(node, {
							class: 'disabled:opacity-100',
							onclick: handleCopy,
							get 'aria-label'() {
								return $.get($0);
							},

							get disabled() {
								return $.get(copied);
							},
							child,
							$$slots: { child: true }
						});
					}

					var node_3 = $.sibling(node, 2);

					TooltipContent(node_3, {
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Click to copy');

							$.append($$anchor, text);
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