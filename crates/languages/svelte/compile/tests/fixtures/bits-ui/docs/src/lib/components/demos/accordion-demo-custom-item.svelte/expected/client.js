import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'title', 'content']);
var root = $.from_html(` <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent transition-all"><!></span>`, 1);
var root_1 = $.from_html(`<div class="pb-[25px]"> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Accordion_demo_custom_item($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Item, ($$anchor, Accordion_Item) => {
		Accordion_Item($$anchor, $.spread_props(() => restProps, {
			class: 'border-dark-10 group border-b px-1.5',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Accordion.Header, ($$anchor, Accordion_Header) => {
					Accordion_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
								Accordion_Trigger($$anchor, {
									class: 'flex w-full flex-1 items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var text = $.first_child(fragment_3);
										var span = $.sibling(text);
										var node_3 = $.child(span);

										CaretDown(node_3, { class: 'size-[18px] transition-all duration-200' });
										$.reset(span);
										$.template_effect(() => $.set_text(text, `${$$props.title ?? ''} `));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Accordion.Content, ($$anchor, Accordion_Content) => {
					Accordion_Content($$anchor, {
						class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var text_1 = $.only_child(div, true);

							$.template_effect(() => $.set_text(text_1, $$props.content));
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}