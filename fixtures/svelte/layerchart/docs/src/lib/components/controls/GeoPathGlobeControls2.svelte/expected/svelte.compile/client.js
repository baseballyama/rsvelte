import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { curveCatmullRomClosed } from 'd3-shape';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-2 mb-4 screenshot-hidden"><!> <div class="mb-2 flex gap-6"><!> <!></div></div>`);

export default function GeoPathGlobeControls2($$anchor, $$props) {
	$.push($$props, true);

	let curve = $.prop($$props, 'curve', 15, undefined),
		minArea = $.prop($$props, 'minArea', 15, undefined),
		velocity = $.prop($$props, 'velocity', 15, 3);

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			CurveMenuField(node_1, {
				showOpenClosed: true,
				get value() {
					return curve();
				},

				set value($$value) {
					curve($$value);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			RangeField(node_2, {
				label: 'Min area',
				min: 0,
				max: 3,
				step: 0.01,
				get value() {
					return minArea();
				},

				set value($$value) {
					minArea($$value);
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (minArea() !== undefined) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_3 = $.child(div_2);

	Field(node_3, {
		label: 'Spin:',
		dense: true,
		labelPlacement: 'left',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				ButtonGroup($$anchor, {
					size: 'sm',
					variant: 'fill-light',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_4 = $.first_child(fragment_1);

						Button(node_4, {
							get disabled() {
								return $$props.timer.running;
							},

							$$events: {
								click: function (...$$args) {
									$$props.timer.start?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Start');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						{
							let $0 = $.derived(() => !$$props.timer.running);

							Button(node_5, {
								get disabled() {
									return $.get($0);
								},

								$$events: {
									click: function (...$$args) {
										$$props.timer.stop?.apply(this, $$args);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Stop');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_6 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => !$$props.timer.running);

		RangeField(node_6, {
			label: 'Velocity:',
			min: -10,
			max: 10,
			get disabled() {
				return $.get($0);
			},
			labelPlacement: 'left',
			get value() {
				return velocity();
			},

			set value($$value) {
				velocity($$value);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}