import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GroupState } from './Group.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Group_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new GroupState(() => ({ children: $$props.children, ...rest }));

	c.chartCtx.registerComponent({
		name: 'Group',
		kind: 'group',
		canvasRender: {
			render: (ctx) => {
				ctx.translate(c.motionX ?? 0, c.motionY ?? 0);

				if ($$props.opacity != null) {
					ctx.globalAlpha *= rest.opacity;
				}
			},

			events: {
				click: $$props.onclick,
				dblclick: $$props.ondblclick,
				pointerenter: $$props.onpointerenter,
				pointermove: $$props.onpointermove,
				pointerleave: $$props.onpointerleave,
				pointerdown: $$props.onpointerdown
			},
			deps: () => [c.motionX, c.motionY, $$props.opacity]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}