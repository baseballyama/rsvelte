import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Switch } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[60px_60px] gap-2 mb-2 screenshot-hidden"><!> <!></div>`);

export default function MarkerControls2($$anchor, $$props) {
	$.push($$props, true);

	let markerStart = $.prop($$props, 'markerStart', 15, true),
		markerEnd = $.prop($$props, 'markerEnd', 15, true);

	var div = root();
	var node = $.child(div);

	Field(node, {
		label: 'Start',
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
						return markerStart();
					},

					set checked($$value) {
						markerStart($$value);
					}
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'End',
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
						return markerEnd();
					},

					set checked($$value) {
						markerEnd($$value);
					}
				});
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}