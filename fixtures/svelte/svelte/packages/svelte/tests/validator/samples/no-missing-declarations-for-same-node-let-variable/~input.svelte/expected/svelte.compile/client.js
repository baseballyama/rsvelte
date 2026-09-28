import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Bla from './Bla.svelte';

var root = $.from_html(`<button slot="foo"> </button>`);

export default function Input($$anchor) {
	Bla($$anchor, {
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				const bar = $.derived(() => $$slotProps.bar);
				const clickFn = $.derived(() => $$slotProps.clickFn);
				var button = root();
				let classes;
				var text = $.only_child(button, true);

				$.template_effect(() => {
					classes = $.set_class(button, 1, '', null, classes, { bar: $.get(bar) });
					$.set_text(text, $.get(bar));
				});

				$.event('click', button, function (...$$args) {
					$.get(clickFn)?.apply(this, $$args);
				});

				$.append($$anchor, button);
			}
		}
	});
}