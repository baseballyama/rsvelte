import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_basic($$anchor) {
	const items = [
		{
			value: "item-1",
			trigger: "Is it accessible?",
			content: "Yes. It adheres to the WAI-ARIA design pattern."
		},

		{
			value: "item-2",
			trigger: "Is it styled?",
			content: "Yes. It comes with default styles that matches the other components' aesthetic."
		},

		{
			value: "item-3",
			trigger: "Is it animated?",
			content: "Yes. It's animated by default, but you can disable it if you prefer."
		}
	];

	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, {
					type: 'single',
					class: 'mx-auto max-w-lg',
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

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
											Accordion_Trigger($$anchor, {
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