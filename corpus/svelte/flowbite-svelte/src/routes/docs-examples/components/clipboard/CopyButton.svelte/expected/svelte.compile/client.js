import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Input } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Copied`, 1);
var root_1 = $.from_html(`<!> Copy`, 1);
var root_2 = $.from_html(`<div class="w-64"><!></div>`);

export default function CopyButton($$anchor) {
	let value = $.state("npm install flowbite");
	var div = root_2();
	var node = $.child(div);

	{
		const right = ($$anchor) => {
			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							CheckOutline(node_2, { class: 'h-3 w-3' });
							$.next();
							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							ClipboardCleanSolid(node_3, { class: 'h-3 w-3' });
							$.next();
							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (success()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				Clipboard($$anchor, {
					size: 'xs',
					color: 'alternative',
					class: '-mr-1 w-20 focus:ring-0',
					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					},
					children,
					$$slots: { default: true }
				});
			}
		};

		Input(node, {
			class: 'text-sm',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			right,
			$$slots: { right: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}