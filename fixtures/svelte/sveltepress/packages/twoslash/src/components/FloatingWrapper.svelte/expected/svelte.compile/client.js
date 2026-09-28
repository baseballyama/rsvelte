import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'floatingContent'
]);

export default function FloatingWrapper($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => import('./Floating.svelte'), null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { default: Comp } = $.get($$source);

			return { Comp };
		});

		var Comp = $.derived(() => $.get($$value).Comp);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const content = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.floatingContent ?? $.noop);
				$.append($$anchor, fragment_2);
			};

			$.component(node_1, () => $.get(Comp), ($$anchor, Comp_1) => {
				Comp_1($$anchor, $.spread_props(() => rest, {
					content,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_3);
					},
					$$slots: { content: true, default: true }
				}));
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}