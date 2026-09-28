import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap } from '@smui/common/internal';
import { Label } from '@smui/common';
import Button from '@smui/button';
import FormField from '@smui/form-field';
import Radio from '@smui/radio';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<div class="svelte-ydxhs5"><!></div> <div class="svelte-ydxhs5"><!> <!></div>`, 1);

export default function _ClassMap($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let big = $.state(false);
	let color = $.state('red');
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		let $0 = $.derived(() => classMap({ 'my-button': true, big: $.get(big), [$.get(color)]: true }));

		Button(node, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('I\'m a Colored Button');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Big');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			style: 'margin-right: 1em;',
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(big);
					},

					set checked($$value) {
						$.set(big, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => ['red', 'blue', 'green'], $.index, ($$anchor, option) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text_2 = $.text();

				$.template_effect(($0) => $.set_text(text_2, $0), [() => `${option[0].toUpperCase()}${option.slice(1)}`]);
				$.append($$anchor, text_2);
			};

			FormField($$anchor, {
				style: 'margin-right: 1em;',
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return option;
						},

						get group() {
							return $.get(color);
						},

						set group($$value) {
							$.set(color, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}