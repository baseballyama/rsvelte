import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";
import DemoContainer from "../demo-container.svelte";
import CustomAccordionItem from "./accordion-demo-custom-item.svelte";

export default function Accordion_demo_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myItems = [
			{
				value: "A",
				title: "Title A",
				content: "Content A",
				disabled: false
			},

			{
				value: "B",
				title: "Title B",
				content: "Content B",
				disabled: false
			},

			{
				value: "C",
				title: "Title C",
				content: "Content C",
				disabled: false
			}
		];

		let {
			items = myItems,
			value = void 0,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				size: 'sm',
				wrapperClass: 'rounded-b-card',
				children: ($$renderer) => {
					if (Accordion.Root) {
						$$renderer.push('<!--[-->');

						Accordion.Root($$renderer, $.spread_props([
							{ class: 'w-full sm:max-w-[70%]' },
							restProps,
							{
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								},

								get ref() {
									return ref;
								},

								set ref($$value) {
									ref = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(items);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let item = each_array[i];

										CustomAccordionItem($$renderer, $.spread_props([item]));
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, ref });
	});
}