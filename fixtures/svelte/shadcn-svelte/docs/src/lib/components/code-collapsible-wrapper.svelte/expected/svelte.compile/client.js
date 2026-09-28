import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div class="absolute end-9 top-1.5 z-10 flex items-center"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Code_collapsible_wrapper($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("group/collapsible relative md:-mx-1", $$props.class));

		$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
			Collapsible_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var div = root();
								var node_2 = $.child(div);

								Button(node_2, $.spread_props({ variant: 'ghost', size: 'sm' }, props, {
									class: 'h-7 rounded-md px-2 text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(open) ? "Collapse" : "Expand"));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));

								var node_3 = $.sibling(node_2, 2);

								Separator(node_3, { orientation: 'vertical', class: 'mx-1.5 !h-4' });
								$.reset(div);
								$.append($$anchor, div);
							};

							$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
								Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
							Collapsible_Content($$anchor, {
								forceMount: true,
								class: 'relative mt-6 overflow-hidden data-[state=closed]:max-h-64 [&>figure]:mt-0 [&>figure]:md:!mx-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									$.snippet(node_5, () => $$props.children ?? $.noop);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_4, 2);

						$.component(node_6, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger_1) => {
							Collapsible_Trigger_1($$anchor, {
								class: 'absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-gradient-to-b from-code/70 to-code text-sm text-muted-foreground group-data-[state=open]/collapsible:hidden',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(open) ? "Collapse" : "Expand"));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
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