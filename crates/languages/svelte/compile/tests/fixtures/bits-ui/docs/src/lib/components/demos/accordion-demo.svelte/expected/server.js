import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";

export default function Accordion_demo($$renderer) {
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

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			class: 'w-full sm:max-w-[70%]',
			type: 'multiple',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: item.value,
							class: 'border-dark-10 group border-b px-1.5',
							children: ($$renderer) => {
								if (Accordion.Header) {
									$$renderer.push('<!--[-->');

									Accordion.Header($$renderer, {
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													class: 'flex w-full flex-1 select-none items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
													children: ($$renderer) => {
														$$renderer.push(`<span class="w-full text-left">${$.escape(item.title)}</span> <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent">`);
														CaretDown($$renderer, { class: 'size-[18px] transition-transform duration-200' });
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
											$$renderer.push(`<div class="pb-[25px]">${$.escape(item.content)}</div>`);
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
}