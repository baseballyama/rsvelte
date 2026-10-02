import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

var root = $.from_html(`<!> <br/><br/> <div class="flexy-dad svelte-1grftjr"><div>Standard</div> <div>Primary</div> <div>Secondary</div></div>`, 1);

export default function _TransitionsAndColor($$anchor) {
	let liftMeUp = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('You raise me up, so I can stand on mountains!');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(liftMeUp);
					},

					set checked($$value) {
						$.set(liftMeUp, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var div = $.sibling(node, 5);
	var div_1 = $.child(div);
	let classes;
	var div_2 = $.sibling(div_1, 2);
	let classes_1;
	var div_3 = $.sibling(div_2, 2);
	let classes_2;

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div_1, 1, 'mdc-elevation-transition rounded flexy-boy svelte-1grftjr', null, classes, { 'mdc-elevation--z4': $.get(liftMeUp) });
		classes_1 = $.set_class(div_2, 1, 'my-primary mdc-elevation-transition rounded flexy-boy svelte-1grftjr', null, classes_1, { elevated: $.get(liftMeUp) });
		classes_2 = $.set_class(div_3, 1, 'my-secondary mdc-elevation-transition rounded flexy-boy svelte-1grftjr', null, classes_2, { elevated: $.get(liftMeUp) });
	});

	$.append($$anchor, fragment);
}