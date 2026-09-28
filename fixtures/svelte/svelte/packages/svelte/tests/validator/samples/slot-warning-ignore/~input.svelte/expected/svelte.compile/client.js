import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<div slot="foo">hi!</div>`);

export default function Input($$anchor, $$props) {
	Component($$anchor, {
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				var div = root();

				$.event('click', div, function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				});

				$.append($$anchor, div);
			}
		}
	});
}