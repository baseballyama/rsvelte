import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';
import { ClipPathState } from './ClipPath.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'useId',
	'disabled',
	'invert',
	'children'
]);

export default function ClipPath_canvas($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		invert = $.prop($$props, 'invert', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const c = new ClipPathState(() => ({
		id: id(),
		useId: $$props.useId,
		disabled: disabled(),
		invert: invert(),
		children: $$props.children,
		...rest
	}));

	const url = $.derived(() => `url(#${id()})`);

	// Cache the Path2D so `ctx.clip()` gets a stable reference per `path` change.
	const canvasPath = $.derived(() => c.effectivePath ? new Path2D(c.effectivePath) : undefined);

	c.chartCtx.registerComponent({
		name: 'ClipPath',
		kind: 'group',
		canvasRender: {
			render: (ctx) => {
				if (!disabled() && $.get(canvasPath)) {
					ctx.clip($.get(canvasPath), invert() ? 'evenodd' : 'nonzero');
				}
			},
			deps: () => [disabled(), $.get(canvasPath), invert()]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ id: id(), url: $.get(url), useId: $$props.useId }));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}