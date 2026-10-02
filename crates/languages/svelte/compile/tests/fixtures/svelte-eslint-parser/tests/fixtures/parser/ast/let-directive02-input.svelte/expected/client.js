import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Hoverable from './Hoverable.svelte';

var root = $.from_html(`<div></div>`);

export default function Let_directive02_input($$anchor) {
	Hoverable($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const hovering = $.derived(() => {
					let { foo: active } = $$slotProps.hovering;

					return { active };
				});

				var div = root();
				let classes;

				$.template_effect(() => classes = $.set_class(div, 1, '', null, classes, { active: $.get(hovering).active }));
				$.append($$anchor, div);
			}
		}
	});
}