import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slots from './diagnostics-slots-imported.svelte';

var root = $.from_html(`<p slot="named"> </p>`);
var root_1 = $.from_html(`<p slot="spread"> </p>`);

export default function Input($$anchor) {
	Slots($$anchor, {
		prop: defaultSlotProp,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const defaultSlotProp = $.derived(() => $$slotProps.defaultSlotProp);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(defaultSlotProp) === 1}
  ${$.get(defaultSlotProp) === false} ${namedSlotProp ?? ''}`));

				$.append($$anchor, text);
			},

			named: ($$anchor, $$slotProps) => {
				const namedSlotProp = $.derived(() => $$slotProps.namedSlotProp);
				var p = root();
				let classes;
				var text_1 = $.only_child(p);

				$.template_effect(() => {
					classes = $.set_class(p, 1, '', null, classes, { namedSlotProp: $.get(namedSlotProp) });

					$.set_text(text_1, `${$.get(namedSlotProp) === 1}
    ${$.get(namedSlotProp) === false}
    ${defaultSlotProp ?? ''}`);
				});

				$.append($$anchor, p);
			},

			spread: ($$anchor, $$slotProps) => {
				const a = $.derived(() => $$slotProps.a);
				const c = $.derived(() => $$slotProps.b);
				const d = $.derived(() => $$slotProps.d);
				var p_1 = root_1();
				var text_2 = $.only_child(p_1);

				$.template_effect(() => $.set_text(text_2, `${$.get(a) === true}
    ${$.get(c) === ''}
    ${$.get(a) === ''}
    ${$.get(d) ?? ''}`));

				$.append($$anchor, p_1);
			}
		}
	});
}