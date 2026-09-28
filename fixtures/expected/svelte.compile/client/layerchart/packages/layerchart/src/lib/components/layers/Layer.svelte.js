import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Canvas from './Canvas.svelte';
import Svg from './Svg.svelte';
import Html from './Html.svelte';
import Frame from '../Frame/Frame.svelte';
import { getSettings } from '$lib/contexts/settings.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'type', 'children']);
var root = $.from_html(`<!> <!>`, 1);

export default function Layer($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let settings = getSettings();
	let layer = $.derived(() => $$props.type ?? settings.layer);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const children = ($$anchor, props = $.noop) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Frame(node_2, { class: 'lc-debug-frame' });

							var node_3 = $.sibling(node_2, 2);

							Frame(node_3, { class: 'lc-debug-frame', full: true });
							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (settings.debug) $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_1, 2);

					$$props.children?.(node_4, props);
					$.append($$anchor, fragment_2);
				};

				Canvas($$anchor, $.spread_props(() => restProps, { children, $$slots: { default: true } }));
			}
		};

		var consequent_3 = ($$anchor) => {
			{
				const children = ($$anchor, props = $.noop) => {
					var fragment_5 = root();
					var node_5 = $.first_child(fragment_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_6 = root();
							var node_6 = $.first_child(fragment_6);

							Frame(node_6, { class: 'lc-debug-frame' });

							var node_7 = $.sibling(node_6, 2);

							Frame(node_7, { class: 'lc-debug-frame', full: true });
							$.append($$anchor, fragment_6);
						};

						$.if(node_5, ($$render) => {
							if (settings.debug) $$render(consequent_2);
						});
					}

					var node_8 = $.sibling(node_5, 2);

					$$props.children?.(node_8, props);
					$.append($$anchor, fragment_5);
				};

				Svg($$anchor, $.spread_props(() => restProps, { children, $$slots: { default: true } }));
			}
		};

		var consequent_5 = ($$anchor) => {
			{
				const children = ($$anchor, props = $.noop) => {
					var fragment_8 = root();
					var node_9 = $.first_child(fragment_8);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_9 = root();
							var node_10 = $.first_child(fragment_9);

							Frame(node_10, { class: 'lc-debug-frame' });

							var node_11 = $.sibling(node_10, 2);

							Frame(node_11, { class: 'lc-debug-frame', full: true });
							$.append($$anchor, fragment_9);
						};

						$.if(node_9, ($$render) => {
							if (settings.debug) $$render(consequent_4);
						});
					}

					var node_12 = $.sibling(node_9, 2);

					$$props.children?.(node_12, props);
					$.append($$anchor, fragment_8);
				};

				Html($$anchor, $.spread_props(() => restProps, { children, $$slots: { default: true } }));
			}
		};

		$.if(node, ($$render) => {
			if ($.get(layer) === 'canvas') $$render(consequent_1); else if ($.get(layer) === 'svg') $$render(consequent_3, 1); else if ($.get(layer) === 'html') $$render(consequent_5, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}