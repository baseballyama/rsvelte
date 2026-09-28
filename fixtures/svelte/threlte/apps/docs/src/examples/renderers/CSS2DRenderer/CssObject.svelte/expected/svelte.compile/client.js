import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { T } from '@threlte/core';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'content',
	'pointerEvents',
	'children'
]);

var root = $.from_html(`<div><!></div> <!>`, 1);

export default function CssObject($$anchor, $$props) {
	let pointerEvents = $.prop($$props, 'pointerEvents', 3, false),
		props = $.rest_props($$props, rest_excludes);

	let element = $.state(void 0);
	var fragment = root();
	var div = $.first_child(fragment);
	let styles;
	var node = $.child(div);

	$.snippet(node, () => $$props.content ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));

	var node_1 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let ref = () => ($$arg0?.()).ref;

					$$props.children?.($$anchor, () => ({ ref: ref() }));
				};

				let $0 = $.derived(() => [$.get(element)]);

				T($$anchor, $.spread_props(() => props, {
					get is() {
						return CSS2DObject;
					},

					get args() {
						return $.get($0);
					},
					children,
					$$slots: { default: true }
				}));
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(element) !== undefined) $$render(consequent);
		});
	}

	$.template_effect(() => styles = $.set_style(div, '', styles, {
		'pointer-events': pointerEvents() ? 'auto' : 'none !important',
		'will-change': 'transform'
	}));

	$.append($$anchor, fragment);
}