import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { slide } from "svelte/transition";

var root = $.from_html(` <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent transition-all"><!></span>`, 1);
var root_1 = $.from_html(`<div><div class="pb-[25px]"> </div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Accordion_demo_transitions($$anchor) {
	const items = [
		{
			title: "What is the meaning of life?",
			content: "To become a better person, to help others, and to leave the world a better place than you found it."
		},

		{
			title: "How do I become a better person?",
			content: "Read books, listen to podcasts, and surround yourself with people who inspire you."
		},

		{
			title: "What is the best way to help others?",
			content: "Give them your time, attention, and love."
		}
	];

	let value = $.state($.proxy([]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			class: 'w-full sm:max-w-[70%]',
			type: 'multiple',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 19, () => items, (item) => item.title, ($$anchor, item, i) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => `${$.get(i)}`);

						$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
							Accordion_Item($$anchor, {
								get value() {
									return $.get($0);
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
														class: 'flex w-full flex-1 items-center justify-between py-5 text-left text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var text = $.first_child(fragment_5);
															var span = $.sibling(text);
															var node_5 = $.child(span);

															CaretDown(node_5, { class: 'size-[18px] transition-all duration-200' });
															$.reset(span);
															$.template_effect(() => $.set_text(text, `${$.get(item).title ?? ''} `));
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

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											let open = () => ($$arg0?.()).open;
											var fragment_6 = $.comment();
											var node_7 = $.first_child(fragment_6);

											{
												var consequent = ($$anchor) => {
													var div = root_1();

													$.attribute_effect(div, () => ({ ...props() }));

													var div_1 = $.child(div);
													var text_1 = $.only_child(div_1, true);

													$.reset(div);
													$.template_effect(() => $.set_text(text_1, $.get(item).content));
													$.transition(3, div, () => slide, () => ({ duration: 1000 }));
													$.append($$anchor, div);
												};

												$.if(node_7, ($$render) => {
													if (open()) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.component(node_6, () => Accordion.Content, ($$anchor, Accordion_Content) => {
											Accordion_Content($$anchor, {
												forceMount: true,
												class: 'overflow-hidden text-sm tracking-[-0.01em]',
												child,
												$$slots: { child: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}