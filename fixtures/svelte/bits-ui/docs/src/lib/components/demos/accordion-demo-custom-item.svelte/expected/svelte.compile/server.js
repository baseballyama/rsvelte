import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";

export default function Accordion_demo_custom_item($$renderer, $$props) {
	let { title, content, $$slots, $$events, ...restProps } = $$props;

	if (Accordion.Item) {
		$$renderer.push('<!--[-->');

		Accordion.Item($$renderer, $.spread_props([
			restProps,
			{
				class: 'border-dark-10 group border-b px-1.5',
				children: ($$renderer) => {
					if (Accordion.Header) {
						$$renderer.push('<!--[-->');

						Accordion.Header($$renderer, {
							children: ($$renderer) => {
								if (Accordion.Trigger) {
									$$renderer.push('<!--[-->');

									Accordion.Trigger($$renderer, {
										class: 'flex w-full flex-1 items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(title)} <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent transition-all">`);
											CaretDown($$renderer, { class: 'size-[18px] transition-all duration-200' });
											$$renderer.push(`<!----></span>`);
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

					$$renderer.push(` `);

					if (Accordion.Content) {
						$$renderer.push('<!--[-->');

						Accordion.Content($$renderer, {
							class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]',
							children: ($$renderer) => {
								$$renderer.push(`<div class="pb-[25px]">${$.escape(content)}</div>`);
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}