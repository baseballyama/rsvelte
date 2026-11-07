import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, ToggleGroup, ToggleOption, RangeField, MenuField } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!> <!></div> <div class="grid grid-cols-3 gap-2 mt-2 mb-2 screenshot-hidden"><!> <!> <!> <!> <!></div> <div class="grid grid-cols-2 gap-2 mt-2 screenshot-hidden"><!> <!></div>`, 1);

export default function TreeControls($$anchor, $$props) {
	$.push($$props, true);

	let dataset = $.prop($$props, 'dataset', 15),
		config = $.prop($$props, 'config', 15);

	const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((type) => ({ label: type, value: type }));
	const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({ label: sweep, value: sweep }));
	var fragment = root_2();
	var div = $.first_child(fragment);
	let classes;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			MenuField($$anchor, {
				label: 'Dataset',
				get options() {
					return $$props.datasetOptions;
				},
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return dataset();
				},

				set value($$value) {
					dataset($$value);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.datasetOptions) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Orientation',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().orientation;
				},

				set value($$value) {
					config(config().orientation = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					ToggleOption(node_2, {
						value: 'horizontal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Horizontal');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'vertical',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Vertical');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					ToggleOption(node_4, {
						value: 'radial',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Radial');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Field(node_5, {
		label: 'Layout',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().layout;
				},

				set value($$value) {
					config(config().layout = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_6 = $.first_child(fragment_5);

					ToggleOption(node_6, {
						value: 'chart',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Chart');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					ToggleOption(node_7, {
						value: 'node',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Node');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_8 = $.child(div_1);

	MenuField(node_8, {
		label: 'Link Type',
		get options() {
			return typeOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return config().type;
		},

		set value($$value) {
			config(config().type = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_1 = ($$anchor) => {
			CurveMenuField($$anchor, {
				get value() {
					return config().curve;
				},

				set value($$value) {
					config(config().curve = $$value, true);
				}
			});
		};

		$.if(node_9, ($$render) => {
			if (config().type === 'd3') $$render(consequent_1);
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		var consequent_2 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Radius',
				min: 0,
				get value() {
					return config().radius;
				},

				set value($$value) {
					config(config().radius = $$value, true);
				}
			});
		};

		$.if(node_10, ($$render) => {
			if (config().type === 'beveled' || config().type === 'rounded') $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_10, 2);

	{
		var consequent_3 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Bend (°)',
				min: -90,
				max: 90,
				get value() {
					return config().bend;
				},

				set value($$value) {
					config(config().bend = $$value, true);
				}
			});
		};

		$.if(node_11, ($$render) => {
			if (config().type === 'swoop') $$render(consequent_3);
		});
	}

	var node_12 = $.sibling(node_11, 2);

	MenuField(node_12, {
		label: 'Link Sweep',
		get options() {
			return sweepOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return config().sweep;
		},

		set value($$value) {
			config(config().sweep = $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_13 = $.child(div_2);

	{
		let $0 = $.derived(() => config().layout !== 'node');

		RangeField(node_13, {
			label: 'Parent Gap',
			min: 0,
			max: 300,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().parentGap;
			},

			set value($$value) {
				config(config().parentGap = $$value, true);
			}
		});
	}

	var node_14 = $.sibling(node_13, 2);

	{
		var consequent_4 = ($$anchor) => {
			{
				let $0 = $.derived(() => config().layout !== 'node');

				RangeField($$anchor, {
					label: 'Angular Spacing (°)',
					min: 5,
					max: 90,
					get disabled() {
						return $.get($0);
					},

					get value() {
						return config().angularSpacing;
					},

					set value($$value) {
						config(config().angularSpacing = $$value, true);
					}
				});
			}
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => config().layout !== 'node');

				RangeField($$anchor, {
					label: 'Sibling Gap',
					min: 0,
					max: 100,
					get disabled() {
						return $.get($0);
					},

					get value() {
						return config().siblingGap;
					},

					set value($$value) {
						config(config().siblingGap = $$value, true);
					}
				});
			}
		};

		$.if(node_14, ($$render) => {
			if (config().orientation === 'radial') $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	$.template_effect(() => classes = $.set_class(div, 1, 'grid gap-2 screenshot-hidden', null, classes, {
		'grid-cols-2': !$$props.datasetOptions,
		'grid-cols-3': $$props.datasetOptions
	}));

	$.append($$anchor, fragment);
	$.pop();
}