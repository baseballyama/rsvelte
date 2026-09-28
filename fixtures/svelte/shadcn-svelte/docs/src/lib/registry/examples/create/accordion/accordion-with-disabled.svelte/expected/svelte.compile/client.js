import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_with_disabled($$anchor) {
	const items = [
		{
			value: "item-1",
			trigger: "Can I access my account history?",
			content: "Yes, you can view your complete account history including all transactions, plan changes, and support tickets in the Account History section of your dashboard.",
			disabled: false
		},

		{
			value: "item-2",
			trigger: "Premium feature information",
			content: "This section contains information about premium features. Upgrade your plan to access this content.",
			disabled: true
		},

		{
			value: "item-3",
			trigger: "How do I update my email address?",
			content: "You can update your email address in your account settings. You'll receive a verification email at your new address to confirm the change.",
			disabled: false
		}
	];

	Example($$anchor, {
		title: 'With Disabled',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, {
					type: 'single',
					class: 'mx-auto max-w-lg overflow-hidden border style-vega:rounded-lg style-nova:rounded-lg style-lyra:rounded-none style-maia:rounded-lg style-mira:rounded-lg',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => items, (item) => item.value, ($$anchor, item) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
								Accordion_Item($$anchor, {
									get value() {
										return $.get(item).value;
									},

									get disabled() {
										return $.get(item).disabled;
									},
									class: 'p-1 data-[state=open]:bg-muted/50',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
											Accordion_Trigger($$anchor, {
												class: 'style-vega:px-4 style-nova:px-2.5 style-lyra:px-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $.get(item).trigger));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Accordion.Content, ($$anchor, Accordion_Content) => {
											Accordion_Content($$anchor, {
												class: 'style-vega:px-4 style-nova:px-2.5 style-lyra:px-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(item).content));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}