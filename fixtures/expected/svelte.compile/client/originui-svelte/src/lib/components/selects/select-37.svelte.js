import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

const country = ($$anchor, item = $.noop) => {
	var fragment = root();
	var span = $.first_child(fragment);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.template_effect(() => {
		$.set_text(text, item().flag);
		$.set_text(text_1, item().label);
	});

	$.append($$anchor, fragment);
};

var root = $.from_html(`<span class="mr-1 text-lg leading-none"> </span> <span class="truncate"> </span>`, 1);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_37($$anchor) {
	const uid = $.props_id();

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
	let value = $.state('s2');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_3();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Options with flag');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						get id() {
							return uid;
						},
						class: '[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var span_2 = root_1();
							var node_3 = $.child(span_2);

							{
								var consequent = ($$anchor) => {
									country($$anchor, () => $.get(selected));
								};

								var alternate = ($$anchor) => {
									var text_3 = $.text('Select a country');

									$.append($$anchor, text_3);
								};

								$.if(node_3, ($$render) => {
									if ($.get(selected)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(span_2);
							$.append($$anchor, span_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => continents, (continent) => continent.label, ($$anchor, continent) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Select.Group, ($$anchor, Select_Group) => {
									Select_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_2();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Select.GroupHeading, ($$anchor, Select_GroupHeading) => {
												Select_GroupHeading($$anchor, {
													class: 'ps-2',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text();

														$.template_effect(() => $.set_text(text_4, $.get(continent).label));
														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.each(node_8, 17, () => $.get(continent).countries, (item) => item.value, ($$anchor, item) => {
												var fragment_7 = $.comment();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, {
														get value() {
															return $.get(item).value;
														},

														children: ($$anchor, $$slotProps) => {
															country($$anchor, () => $.get(item));
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}