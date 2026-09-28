import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomLine } from 'svelte-inspect-value';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'showString']);
var root = $.from_html(`<div class="text svelte-17r1ghm"> </div>`);
var root_1 = $.from_html(`<div class="color svelte-17r1ghm"><!></div>`);
var root_2 = $.from_html(`<span class="value string"> </span>`);

export default function HexString($$anchor, $$props) {
	$.push($$props, true);

	// extra props
	let showString = $.prop($$props, 'showString', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	let isColor = $.derived(() => $$props.value.startsWith('#'));

	{
		let $0 = $.derived(() => $.get(isColor) ? '' : 'string');

		CustomLine($$anchor, $.spread_props(
			{
				get value() {
					return $$props.value;
				}
			},
			() => rest,
			{
				get type() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							var div = root_1();
							var node_1 = $.child(div);

							{
								var consequent = ($$anchor) => {
									var div_1 = root();
									var text = $.only_child(div_1, true);

									$.template_effect(() => $.set_text(text, $$props.value));
									$.append($$anchor, div_1);
								};

								$.if(node_1, ($$render) => {
									if (showString()) $$render(consequent);
								});
							}

							$.reset(div);

							$.template_effect(() => {
								$.set_style(div, `background-color: ${$$props.value ?? ''};`);
								$.set_attribute(div, 'title', $$props.value);
							});

							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var span = root_2();
							var text_1 = $.only_child(span);

							$.template_effect(() => $.set_text(text_1, `'${$$props.value ?? ''}'`));
							$.append($$anchor, span);
						};

						$.if(node, ($$render) => {
							if ($.get(isColor)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}