import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { slide } from "svelte/transition";

export default function Accordion_demo_transitions($$renderer) {
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

	let value = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Accordion.Root) {
			$$renderer.push('<!--[-->');

			Accordion.Root($$renderer, {
				class: 'w-full sm:max-w-[70%]',
				type: 'multiple',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let item = each_array[i];

						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value: `${i}`,
								class: 'border-dark-10 group border-b px-1.5',
								children: ($$renderer) => {
									if (Accordion.Header) {
										$$renderer.push('<!--[-->');

										Accordion.Header($$renderer, {
											children: ($$renderer) => {
												if (Accordion.Trigger) {
													$$renderer.push('<!--[-->');

													Accordion.Trigger($$renderer, {
														class: 'flex w-full flex-1 items-center justify-between py-5 text-left text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(item.title)} <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent transition-all">`);
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

									{
										function child($$renderer, { props, open }) {
											if (open) {
												$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}><div class="pb-[25px]">${$.escape(item.content)}</div></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										if (Accordion.Content) {
											$$renderer.push('<!--[-->');

											Accordion.Content($$renderer, {
												forceMount: true,
												class: 'overflow-hidden text-sm tracking-[-0.01em]',
												child,
												$$slots: { child: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}