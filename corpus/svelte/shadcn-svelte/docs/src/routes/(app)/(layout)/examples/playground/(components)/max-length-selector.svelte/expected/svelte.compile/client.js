import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<div><div class="flex items-center justify-between"><!> <span class="w-12 rounded-md border border-transparent px-2 py-0.5 text-end text-sm text-muted-foreground hover:border-border"> </span></div> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid gap-2 pt-2"><!></div>`);

export default function Max_length_selector($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_2();
	var node = $.child(div);

	$.component(node, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
		HoverCard_Root($$anchor, {
			openDelay: 200,
			closeDelay: 100,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var div_1 = root();

						$.attribute_effect(div_1, () => ({ class: 'grid gap-4', ...props() }));

						var div_2 = $.child(div_1);
						var node_2 = $.child(div_2);

						Label(node_2, {
							for: 'maxlength',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Maximum Length');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var span = $.sibling(node_2, 2);
						var text_1 = $.only_child(span, true);

						$.reset(div_2);

						var node_3 = $.sibling(div_2, 2);

						Slider(node_3, $.spread_props(
							{
								id: 'maxlength',
								max: 4000,
								step: 10,
								class: '[&_[role=slider]]:h-4 [&_[role=slider]]:w-4',
								'aria-label': 'Maximum Length'
							},
							() => restProps,
							{
								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								}
							}
						));

						$.reset(div_1);
						$.template_effect(() => $.set_text(text_1, value()));
						$.append($$anchor, div_1);
					};

					$.component(node_1, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
						HoverCard_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
					HoverCard_Content($$anchor, {
						class: 'w-[260px] text-sm',
						side: 'left',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('The maximum number of tokens to generate. Requests can use up to 2,048 or 4,000 tokens, shared\n			between prompt and completion. The exact limit varies by model.');

							$.append($$anchor, text_2);
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
	$.append($$anchor, div);
	$.pop();
}