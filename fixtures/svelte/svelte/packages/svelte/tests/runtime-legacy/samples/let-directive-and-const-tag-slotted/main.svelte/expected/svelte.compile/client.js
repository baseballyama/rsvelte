import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<div slot="foo"><span> </span></div>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		things: [1, 2],
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.thing);
				const props = $.derived(() => ({ thing: $.get(thing) }));
				var div = root();
				var span = $.child(div);
				var text = $.only_child(span, true);

				$.reset(div);
				$.template_effect(() => $.set_text(text, $.get(props).thing));
				$.append($$anchor, div);
			}
		}
	});
}