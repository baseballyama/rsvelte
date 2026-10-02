import * as $ from 'svelte/internal/server';
import * as Command from '$lib/components/ui/command';
import { parseDate } from 'yeezy-dates';

export default function Nlp_date_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placeholder = 'E.g. "tomorrow at 5pm" or "in 2 hours"',
			min,
			max,
			onChoice
		} = $$props;

		let value = '';
		const suggestions = $.derived(() => parseDate(value).filter((suggestion) => (min === undefined || suggestion.date > min) && (max === undefined || suggestion.date < max)));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.Root) {
				$$renderer.push('<!--[-->');

				Command.Root($$renderer, {
					shouldFilter: false,
					class: 'border-border h-fit border',
					children: ($$renderer) => {
						if (Command.Input) {
							$$renderer.push('<!--[-->');

							Command.Input($$renderer, {
								placeholder,
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Command.List) {
							$$renderer.push('<!--[-->');

							Command.List($$renderer, {
								children: ($$renderer) => {
									if (Command.Group) {
										$$renderer.push('<!--[-->');

										Command.Group($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(suggestions());

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let suggestion = each_array[$$index];

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															onSelect: () => {
																onChoice?.(suggestion);
															},

															children: ($$renderer) => {
																$$renderer.push(`<div class="flex w-full place-items-center justify-between gap-2"><span>${$.escape(suggestion.label)}</span> <span class="text-muted-foreground">${$.escape(suggestion.date.toDateString())}
							${$.escape(suggestion.date.toLocaleTimeString())}</span></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}