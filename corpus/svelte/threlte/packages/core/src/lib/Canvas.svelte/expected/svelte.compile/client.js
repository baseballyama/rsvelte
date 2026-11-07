import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Context from './components/Context/Context.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<div class="svelte-x6cza5"><canvas class="svelte-x6cza5"><!></canvas></div>`);

export default function Canvas($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	let canvas = $.state(void 0);
	let dom = $.state(void 0);
	var div = root();
	var canvas_1 = $.child(div);
	var node = $.child(canvas_1);

	{
		var consequent = ($$anchor) => {
			Context($$anchor, $.spread_props(
				{
					get dom() {
						return $.get(dom);
					},

					get canvas() {
						return $.get(canvas);
					}
				},
				() => rest,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ($.get(canvas) && $.get(dom)) $$render(consequent);
		});
	}

	$.reset(canvas_1);
	$.bind_this(canvas_1, ($$value) => $.set(canvas, $$value), () => $.get(canvas));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(dom, $$value), () => $.get(dom));
	$.append($$anchor, div);
}