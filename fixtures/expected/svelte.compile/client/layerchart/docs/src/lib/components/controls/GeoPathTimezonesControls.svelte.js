import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, SelectField, Switch } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[1fr_auto_auto_2fr] gap-2 my-2 screenshot-hidden"><!> <!> <!></div>`);

export default function GeoPathTimezonesControls($$anchor, $$props) {
	$.push($$props, true);

	let projection = $.prop($$props, 'projection', 15),
		enableClip = $.prop($$props, 'enableClip', 15, false),
		showDaylight = $.prop($$props, 'showDaylight', 15, false);

	var div = root();
	var node = $.child(div);

	SelectField(node, {
		label: 'Projections',
		get options() {
			return $$props.projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return projection();
		},

		set value($$value) {
			projection($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Clip',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return enableClip();
					},

					set checked($$value) {
						enableClip($$value);
					}
				});
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Daylight',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return showDaylight();
					},

					set checked($$value) {
						showDaylight($$value);
					}
				});
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}