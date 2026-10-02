import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import HtmlView from './HTMLView.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<div class="image svelte-1h2yw57"><img class="svelte-1h2yw57"/></div>`);

export default function HTMLImageElementView($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let options = useOptions();

	HtmlView($$anchor, $.spread_props(
		{
			get value() {
				return $$props.value;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var div = root();
						var img = $.only_child(div);

						$.template_effect(() => {
							$.set_attribute(img, 'alt', $$props.value.alt);
							$.set_attribute(img, 'src', $$props.value.src);
						});

						$.append($$anchor, div);
					};

					$.if(node, ($$render) => {
						if ($$props.value.src && options.value.embedMedia) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}