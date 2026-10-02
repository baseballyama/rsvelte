import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";

var root = $.from_html(
	`<p>Our flagship product combines cutting-edge technology with sleek design. Built with premium
				materials, it offers unparalleled performance and reliability.</p> <p>Key features include advanced processing capabilities, and an intuitive user interface
				designed for both beginners and experts.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<p>We offer worldwide shipping through trusted courier partners. Standard delivery takes 3-5
				business days, while express shipping ensures delivery within 1-2 business days.</p> <p>All orders are carefully packaged and fully insured. Track your shipment in real-time
				through our dedicated tracking portal.</p>`,
	1
);

var root_3 = $.from_html(
	`<p>We stand behind our products with a comprehensive 30-day return policy. If you&apos;re not
				completely satisfied, simply return the item in its original condition.</p> <p>Our hassle-free return process includes free return shipping and full refunds processed
				within 48 hours of receiving the returned item.</p>`,
	1
);

var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full sm:max-w-[70%]',
			value: 'item-1',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						value: 'item-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
								Accordion_Trigger($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Product Information');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Accordion.Content, ($$anchor, Accordion_Content) => {
								Accordion_Content($$anchor, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();

										$.next(2);
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

				$.component(node_4, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
					Accordion_Item_1($$anchor, {
						value: 'item-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_1) => {
								Accordion_Trigger_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Shipping Details');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
								Accordion_Content_1($$anchor, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();

										$.next(2);
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

				var node_7 = $.sibling(node_4, 2);

				$.component(node_7, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
					Accordion_Item_2($$anchor, {
						value: 'item-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_8 = $.first_child(fragment_6);

							$.component(node_8, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_2) => {
								Accordion_Trigger_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Return Policy');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Accordion.Content, ($$anchor, Accordion_Content_2) => {
								Accordion_Content_2($$anchor, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_3();

										$.next(2);
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
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
}