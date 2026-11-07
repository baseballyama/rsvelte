import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { loadYoga } from 'yoga-layout/load';
import InnerFlex from './InnerFlex.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'ref']);

export default function Flex($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	let yoga = $.state(void 0);

	const initialize = async () => {
		$.set(yoga, await loadYoga(), true);
	};

	initialize();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let reflow = () => ($$arg0?.()).reflow;
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ reflow: reflow(), width: width(), height: height() }));
					$.append($$anchor, fragment_2);
				};

				InnerFlex($$anchor, $.spread_props(
					{
						get yoga() {
							return $.get(yoga);
						}
					},
					() => props,
					{
						get ref() {
							return ref();
						},

						set ref($$value) {
							ref($$value);
						},
						children,
						$$slots: { default: true }
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if ($.get(yoga)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}