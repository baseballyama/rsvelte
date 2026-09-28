import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, Tooltip, useTooltip } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-4"><button class="btn preset-filled w-[150px]">Trigger</button> <!></div>`);

export default function Provider_pattern($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const tooltip = useTooltip({ id });
	var div = root_1();
	var button = $.child(div);
	var node = $.sibling(button, 2);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			get value() {
				return tooltip;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(($0) => $.set_text(text, `Anchor (${$0 ?? ''})`), [() => tooltip().open ? 'open' : 'closed']);
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				Portal(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Tooltip.Positioner, ($$anchor, Tooltip_Positioner) => {
							Tooltip_Positioner($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											class: 'card bg-surface-100-900 p-2  shadow-xl',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Hello Skeleton');

												$.append($$anchor, text_1);
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
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.delegated('click', button, () => tooltip().setOpen(!tooltip().open));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);