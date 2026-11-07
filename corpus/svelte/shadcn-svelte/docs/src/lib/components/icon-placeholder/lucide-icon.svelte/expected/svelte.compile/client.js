import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lucideIconLoader } from "./icon-loader.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'icon',
	'placeholder',
	'class'
]);

export default function Lucide_icon($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	// svelte-ignore state_referenced_locally
	const IconPromise = lucideIconLoader($$props.icon);

	const rp = $.derived(() => restProps);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => IconPromise,
		($$anchor) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.snippet(node_4, () => $$props.placeholder ?? $.noop);
			$.append($$anchor, fragment_4);
		},
		($$anchor, Icon) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => $.get(Icon), ($$anchor, Icon_1) => {
						Icon_1($$anchor, $.spread_props(
							{
								get class() {
									return $$props.class;
								}
							},
							() => $.get(rp)
						));
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.snippet(node_3, () => $$props.placeholder ?? $.noop);
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