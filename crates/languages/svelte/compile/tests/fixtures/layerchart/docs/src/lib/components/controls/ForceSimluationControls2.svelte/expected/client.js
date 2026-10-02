import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Switch } from 'svelte-ux';

var root = $.from_html(`<label class="flex gap-2 items-center text-sm">Sticky <!></label>`);
var root_1 = $.from_html(`<div class="flex w-full justify-end screenshot-hidden"><!></div>`);

export default function ForceSimluationControls2($$anchor, $$props) {
	$.push($$props, true);

	let sticky = $.prop($$props, 'sticky', 15, true);
	var div = root_1();
	var node = $.child(div);

	Field(node, {
		dense: true,
		class: 'inline-block mb-2',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);
				var label = root();
				var node_1 = $.sibling($.child(label));

				Switch(node_1, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return sticky();
					},

					set checked($$value) {
						sticky($$value);
					}
				});

				$.reset(label);
				$.template_effect(() => $.set_attribute(label, 'for', $.get(id)));
				$.append($$anchor, label);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}