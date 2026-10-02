import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "$lib/components/markdown/code.svelte";
import { Popover } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import Info from "phosphor-svelte/lib/Info";

var root = $.from_html(`<!> <span class="sr-only">See enum options</span>`, 1);
var root_1 = $.from_html(`<div class="**:data-line:pr-2.5! [&amp;_pre]:my-0! [&amp;_pre]:mb-0! [&amp;_pre]:overflow-x-visible! [&amp;_pre]:pt-0! [&amp;_pre]:pb-0! [&amp;_pre]:ring-0! [&amp;_pre]:ring-offset-0! [&amp;_pre]:outline-hidden! [&amp;_pre]:mt-0 [&amp;_pre]:border-0 [&amp;_pre]:p-0"><!></div>`);
var root_2 = $.from_html(`<!> <!> <span aria-hidden="true" class="hidden"> </span>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-1.5"><!> <!></div>`);

export default function Data_attrs_value_content($$anchor, $$props) {
	$.push($$props, true);

	var div = root_3();
	var node = $.child(div);

	Code(node, {
		class: 'bg-transparent px-0',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.attr.variant === "enum" ? "enum" : $$props.attr.value));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
							Popover_Trigger($$anchor, {
								'data-llm-ignore': true,
								class: 'rounded-button text-muted-foreground focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									Info(node_4, { class: 'size-4', weight: 'bold' });
									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								preventScroll: false,
								side: 'top',
								sideOffset: 10,
								class: 'rounded-card border-border shadow-popover z-50 border-2 bg-zinc-50 py-1.5 pl-1.5 pr-0.5 dark:bg-[#121212]',
								children: ($$anchor, $$slotProps) => {
									ScrollArea($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div_1 = root_1();
											var node_6 = $.child(div_1);

											$.component(node_6, () => $$props.attr.value, ($$anchor, attr_value) => {
												attr_value($$anchor, {});
											});

											$.reset(div_1);
											$.append($$anchor, div_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var span = $.sibling(node_5, 2);
						var text_1 = $.only_child(span);

						$.template_effect(() => $.set_text(text_1, `- ${$$props.attr.stringValue ?? ''}`));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.attr.variant === "enum") $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}