import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { HugeiconsIcon } from "@hugeicons/svelte";
import { hugeiconsIconLoader } from "./icon-loader.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'icon',
	'placeholder',
	'className'
]);

export default function Hugeicons_icon($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	// svelte-ignore state_referenced_locally
	const IconPromise = hugeiconsIconLoader($$props.icon);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => IconPromise,
		($$anchor) => {
			var fragment_4 = $.comment();
			var node_3 = $.first_child(fragment_4);

			$.snippet(node_3, () => $$props.placeholder ?? $.noop);
			$.append($$anchor, fragment_4);
		},
		($$anchor, Icon) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					HugeiconsIcon($$anchor, $.spread_props(
						{
							get icon() {
								return $.get(Icon);
							},
							strokeWidth: 2,
							'data-slot': 'hugeicons-icon',
							get className() {
								return $$props.className;
							}
						},
						() => restProps
					));
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.snippet(node_2, () => $$props.placeholder ?? $.noop);
					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(Icon) !== null) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}