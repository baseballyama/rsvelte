import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[1fr_auto] gap-2 items-end mb-4 screenshot-hidden"><div class="mb-2 flex gap-6"><!> <!></div></div>`);

export default function GeoPathSubmarineControls($$anchor, $$props) {
	$.push($$props, true);

	let velocity = $.prop($$props, 'velocity', 15, 3);
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
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
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						Button(node_1, {
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

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => !$$props.timer.running);

							Button(node_2, {
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

	var node_3 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => !$$props.timer.running);

		RangeField(node_3, {
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

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}