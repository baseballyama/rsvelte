import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { range } from 'd3-array';
import { randomNormal } from 'd3-random';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';
import { Chart, Labels, Layer, Points, Voronoi } from 'layerchart';

var root = $.from_html(`<div slot="append" class="flex items-center pl-2" role="none"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2 w-60"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Voronoi_1($$anchor, $$props) {
	$.push($$props, true);

	const width = 900;
	const height = 600;
	const randomX = randomNormal(width / 2, 110);
	const randomY = randomNormal(height / 2, 95);
	const data = range(110).map((i) => ({ i, x: randomX(), y: randomY() })).filter((d) => d.x >= 0 && d.x <= width && d.y >= 0 && d.y <= height);

	const linkTypeOptions = [
		{ label: 'Straight', value: 'straight' },
		{ label: 'Swoop', value: 'swoop' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Square', value: 'square' },
		{ label: 'Beveled', value: 'beveled' }
	];

	let linkType = $.state('straight');
	let useLinks = $.state(true);
	let occludeLabels = $.state(true);
	let spacing = $.state(2);
	let showVoronoi = $.state(false);
	var $$exports = { data };
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SelectField(node, {
		label: 'Links',
		get options() {
			return linkTypeOptions;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		class: 'w-60',
		get value() {
			return $.get(linkType);
		},

		set value($$value) {
			$.set(linkType, $$value, true);
		},

		$$slots: {
			append: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_1 = $.child(div_1);

				Switch(node_1, {
					size: 'md',
					get checked() {
						return $.get(useLinks);
					},

					set checked($$value) {
						$.set(useLinks, $$value, true);
					}
				});

				$.reset(div_1);
				$.delegated('click', div_1, (e) => e.stopPropagation());
				$.append($$anchor, div_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Field(node_2, {
		label: 'Occlude',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);
				var div_2 = root_1();
				var node_3 = $.child(div_2);

				{
					let $0 = $.derived(() => !$.get(occludeLabels));

					RangeField(node_3, {
						min: 0,
						max: 50,
						get disabled() {
							return $.get($0);
						},
						class: 'flex-1',
						get value() {
							return $.get(spacing);
						},

						set value($$value) {
							$.set(spacing, $$value, true);
						}
					});
				}

				var node_4 = $.sibling(node_3, 2);

				Switch(node_4, {
					size: 'md',
					get id() {
						return $.get(id);
					},

					get checked() {
						return $.get(occludeLabels);
					},

					set checked($$value) {
						$.set(occludeLabels, $$value, true);
					}
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			}
		}
	});

	var node_5 = $.sibling(node_2, 2);

	Field(node_5, {
		label: 'Show voronoi',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return $.get(showVoronoi);
					},

					set checked($$value) {
						$.set(showVoronoi, $$value, true);
					}
				});
			}
		}
	});

	$.reset(div);

	var node_6 = $.sibling(div, 2);

	Chart(node_6, {
		get data() {
			return data;
		},
		x: 'x',
		xDomain: [0, width],
		y: 'y',
		yDomain: [0, height],
		padding: 16,
		height: 500,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_7 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							Voronoi($$anchor, { classes: { path: 'stroke-surface-content/20' } });
						};

						$.if(node_7, ($$render) => {
							if ($.get(showVoronoi)) $$render(consequent);
						});
					}

					var node_8 = $.sibling(node_7, 2);

					Points(node_8, { r: 2, class: 'fill-surface-content' });

					var node_9 = $.sibling(node_8, 2);

					{
						let $0 = $.derived(() => $.get(useLinks)
							? { type: $.get(linkType), class: 'stroke-surface-content/40' }
							: false);

						let $1 = $.derived(() => $.get(occludeLabels) ? { padding: $.get(spacing) } : false);

						Labels(node_9, {
							value: (d) => d.i,
							layout: 'voronoi',
							get links() {
								return $.get($0);
							},

							get occlude() {
								return $.get($1);
							},
							fontSize: 10,
							class: 'fill-surface-content pointer-events-none'
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);