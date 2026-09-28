import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

function country($$renderer, item) {
	$$renderer.push(`<span class="mr-1 text-lg leading-none">${$.escape(item.flag)}</span> <span class="truncate">${$.escape(item.label)}</span>`);
}

export default function Select_37($$renderer) {
	const uid = $.props_id($$renderer);

	const continents = [
		{
			countries: [
				{ flag: '🇺🇸', label: 'United States', value: 's1' },
				{ flag: '🇨🇦', label: 'Canada', value: 's2' },
				{ flag: '🇲🇽', label: 'Mexico', value: 's3' }
			],
			label: 'America'
		},

		{
			countries: [
				{ flag: '🇿🇦', label: 'South Africa', value: 's4' },
				{ flag: '🇳🇬', label: 'Nigeria', value: 's5' },
				{ flag: '🇲🇦', label: 'Morocco', value: 's6' }
			],
			label: 'Africa'
		},

		{
			countries: [
				{ flag: '🇨🇳', label: 'China', value: 's7' },
				{ flag: '🇯🇵', label: 'Japan', value: 's8' },
				{ flag: '🇮🇳', label: 'India', value: 's9' }
			],
			label: 'Asia'
		},

		{
			countries: [
				{ flag: '🇬🇧', label: 'United Kingdom', value: 's10' },
				{ flag: '🇫🇷', label: 'France', value: 's11' },
				{ flag: '🇩🇪', label: 'Germany', value: 's12' }
			],
			label: 'Europe'
		},

		{
			countries: [
				{ flag: '🇦🇺', label: 'Australia', value: 's13' },
				{ flag: '🇳🇿', label: 'New Zealand', value: 's14' }
			],
			label: 'Oceania'
		}
	];

	const items = continents.reduce((previous, current) => [...previous, ...current.countries], []);
	let value = 's2';
	const selected = $.derived(() => items.find((i) => i.value === value));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Options with flag`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (Select.Root) {
			$$renderer.push('<!--[-->');

			Select.Root($$renderer, {
				type: 'single',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Select.Trigger) {
						$$renderer.push('<!--[-->');

						Select.Trigger($$renderer, {
							id: uid,
							class: '[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
							children: ($$renderer) => {
								$$renderer.push(`<span>`);

								if (selected()) {
									$$renderer.push('<!--[0-->');
									country($$renderer, selected());
								} else {
									$$renderer.push(`<!--[-1-->Select a country`);
								}

								$$renderer.push(`<!--]--></span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Select.Content) {
						$$renderer.push('<!--[-->');

						Select.Content($$renderer, {
							class: '[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(continents);

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let continent = each_array[$$index_1];

									if (Select.Group) {
										$$renderer.push('<!--[-->');

										Select.Group($$renderer, {
											children: ($$renderer) => {
												if (Select.GroupHeading) {
													$$renderer.push('<!--[-->');

													Select.GroupHeading($$renderer, {
														class: 'ps-2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(continent.label)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array_1 = $.ensure_array_like(continent.countries);

												for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
													let item = each_array_1[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: item.value,
															children: ($$renderer) => {
																country($$renderer, item);
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

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}