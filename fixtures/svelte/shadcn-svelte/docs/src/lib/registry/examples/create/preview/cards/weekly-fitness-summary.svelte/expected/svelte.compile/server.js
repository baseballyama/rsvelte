import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Weekly_fitness_summary($$renderer) {
	const FITNESS_WEEKLY_LOAD = [
		{ day: "M", load: 84 },
		{ day: "T", load: 52 },
		{ day: "W", load: 73 },
		{ day: "T", load: 66 },
		{ day: "F", load: 91 },
		{ day: "S", load: 48 },
		{ day: "S", load: 61 }
	];

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Weekly Fitness Summary`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Calories and workout load by day`);
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

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							$$renderer.push(`<div class="grid grid-cols-7 gap-1.5"><!--[-->`);

							const each_array = $.ensure_array_like(FITNESS_WEEKLY_LOAD);

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let { day, load } = each_array[index];

								$$renderer.push(`<div class="rounded-md p-1.5 text-center ring ring-border"><div class="text-sm text-muted-foreground">${$.escape(day)}</div> <div class="relative mt-1 h-16 overflow-hidden rounded-sm bg-muted"><div class="absolute inset-x-0 bottom-0 rounded-sm bg-chart-3"${$.attr_style(`height: ${$.stringify(load)}%`)}></div></div></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View details`);
								},
								$$slots: { default: true }
							});
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