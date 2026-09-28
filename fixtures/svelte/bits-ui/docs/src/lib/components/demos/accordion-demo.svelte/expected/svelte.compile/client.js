import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";

var root = $.from_html(`<span class="w-full text-left"> </span> <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent"><!></span>`, 1);
var root_1 = $.from_html(`<div class="pb-[25px]"> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Accordion_demo($$anchor) {
	const items = [
		{
			value: "1",
			title: "What is the meaning of life?",
			content: "To become a better person, to help others, and to leave the world a better place than you found it."
		},

		{
			value: "2",
			title: "How do I become a better person?",
			content: "Read books, listen to podcasts, and surround yourself with people who inspire you."
		},

		{
			value: "3",
			title: "What is the best way to help others?",
			content: "Give them your time, attention, and love."
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			class: 'w-full sm:max-w-[70%]',
			type: 'multiple',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => items, (item) => item.value, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).value;
							},
							class: 'border-dark-10 group border-b px-1.5',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													class: 'flex w-full flex-1 select-none items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var span = $.first_child(fragment_5);
														var text = $.only_child(span, true);
														var span_1 = $.sibling(span, 2);
														var node_5 = $.child(span_1);

														CaretDown(node_5, { class: 'size-[18px] transition-transform duration-200' });
														$.reset(span_1);
														$.template_effect(() => $.set_text(text, $.get(item).title));
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_3, 2);

								$.component(node_6, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
										children: ($$anchor, $$slotProps) => {
											var div = root_1();
											var text_1 = $.only_child(div, true);

											$.template_effect(() => $.set_text(text_1, $.get(item).content));
											$.append($$anchor, div);
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
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}