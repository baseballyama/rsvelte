import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Hoverable from './Hoverable.svelte';

var root = $.from_html(`<p>I am being hovered upon.</p>`);
var root_1 = $.from_html(`<p>Hover over me!</p>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Slot_props03_input($$anchor) {
	Hoverable($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const hovering = $.derived(() => $$slotProps.hovering);
				var div = root_2();
				let classes;
				var node = $.child(div);

				{
					var consequent = ($$anchor) => {
						var p = root();

						$.append($$anchor, p);
					};

					var alternate = ($$anchor) => {
						var p_1 = root_1();

						$.append($$anchor, p_1);
					};

					$.if(node, ($$render) => {
						if ($.get(hovering)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div);
				$.template_effect(() => classes = $.set_class(div, 1, 'svelte-12pir8e', null, classes, { active: $.get(hovering) }));
				$.append($$anchor, div);
			}
		}
	});
}