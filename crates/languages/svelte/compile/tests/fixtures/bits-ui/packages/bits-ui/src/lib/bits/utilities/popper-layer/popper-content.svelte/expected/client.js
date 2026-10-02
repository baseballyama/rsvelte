import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FloatingLayerContentStatic from "../floating-layer/components/floating-layer-content-static.svelte";
import FloatingLayerContent from "../floating-layer/components/floating-layer-content.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'content',
	'isStatic',
	'onPlaced'
]);

export default function Popper_content($$anchor, $$props) {
	let isStatic = $.prop($$props, 'isStatic', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			FloatingLayerContentStatic($$anchor, {
				get content() {
					return $$props.content;
				},

				get onPlaced() {
					return $$props.onPlaced;
				}
			});
		};

		var alternate = ($$anchor) => {
			FloatingLayerContent($$anchor, $.spread_props(
				{
					get content() {
						return $$props.content;
					},

					get onPlaced() {
						return $$props.onPlaced;
					}
				},
				() => restProps
			));
		};

		$.if(node, ($$render) => {
			if (isStatic()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}