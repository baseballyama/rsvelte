import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Accordion_basic($$renderer) {
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

	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, {
					type: 'single',
					class: 'mx-auto max-w-lg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: item.value,
									children: ($$renderer) => {
										if (Accordion.Trigger) {
											$$renderer.push('<!--[-->');

											Accordion.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.trigger)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Accordion.Content) {
											$$renderer.push('<!--[-->');

											Accordion.Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.content)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}