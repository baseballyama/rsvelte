import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<div slot="someslot"><h2> </h2></div>`);
var root_2 = $.from_html(`<div slot="slotwithoutchildren"></div>`);
var root_3 = $.from_html(`<div slot="slotwithmultiplelets"></div>`);
var root_4 = $.from_html(`<p slot="desc">Test</p>`);

export default function Input($$anchor) {
	Component($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const new_var = $.derived(() => $$slotProps.var);
				var h1 = root();
				var text = $.only_child(h1);

				$.template_effect(() => $.set_text(text, `Hello ${$.get(new_var) ?? ''}`));
				$.append($$anchor, h1);
			},

			someslot: ($$anchor, $$slotProps) => {
				const newvar = $.derived(() => $$slotProps.slotvar);
				var div = root_1();
				let classes;
				var h2 = $.child(div);
				var text_1 = $.only_child(h2);

				$.reset(div);

				$.template_effect(() => {
					classes = $.set_class(div, 1, '', null, classes, { newvar: $.get(newvar) });
					$.set_text(text_1, `Hi Slot ${$.get(newvar) ?? ''}`);
				});

				$.append($$anchor, div);
			},

			slotwithoutchildren: ($$anchor, $$slotProps) => {
				const newvar2 = $.derived(() => $$slotProps.newvar2);
				var div_1 = root_2();
				let classes_1;

				$.template_effect(() => classes_1 = $.set_class(div_1, 1, '', null, classes_1, { newvar2: $.get(newvar2) }));
				$.append($$anchor, div_1);
			},

			slotwithmultiplelets: ($$anchor, $$slotProps) => {
				const hi1 = $.derived(() => $$slotProps.hi1);
				const hi2 = $.derived(() => $$slotProps.hi2);
				const hi3alias = $.derived(() => $$slotProps.hi3);
				var div_2 = root_3();

				$.append($$anchor, div_2);
			},

			desc: ($$anchor, $$slotProps) => {
				var p = root_4();

				$.append($$anchor, p);
			}
		}
	});
}