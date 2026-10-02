import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'heading'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Command_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("overflow-hidden p-1 text-foreground", $$props.class));

		$.component(node, () => CommandPrimitive.Group, ($$anchor, CommandPrimitive_Group) => {
			CommandPrimitive_Group($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => CommandPrimitive.GroupHeading, ($$anchor, CommandPrimitive_GroupHeading) => {
									CommandPrimitive_GroupHeading($$anchor, {
										class: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $$props.heading));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if ($$props.heading) $$render(consequent);
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => CommandPrimitive.GroupItems, ($$anchor, CommandPrimitive_GroupItems) => {
							CommandPrimitive_GroupItems($$anchor, {
								get children() {
									return $$props.children;
								}
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}