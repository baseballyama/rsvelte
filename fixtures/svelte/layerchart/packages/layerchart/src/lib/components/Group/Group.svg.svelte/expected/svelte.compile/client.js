import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GroupState } from './Group.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'preventTouchMove',
	'transitionIn',
	'transitionInParams',
	'class',
	'children',
	'ref',
	'x',
	'y',
	'initialX',
	'initialY',
	'data',
	'key',
	'center',
	'motion'
]);

var root = $.from_svg(`<g><!></g>`);

export default function Group_svg($$anchor, $$props) {
	$.push($$props, true);

	let preventTouchMove = $.prop($$props, 'preventTouchMove', 3, false),
		refProp = $.prop($$props, 'ref', 15),
		// Pull out props that collide with `<g>` SVG attribute names so the
		// `{...rest}` spread doesn't mistakenly set `x="someAccessor"` etc.
		rest = $.rest_props($$props, rest_excludes);

	const c = new GroupState(() => ({
		preventTouchMove: preventTouchMove(),
		transitionIn: $$props.transitionIn,
		transitionInParams: $$props.transitionInParams,
		class: $$props.class,
		children: $$props.children,
		x: $$props.x,
		y: $$props.y,
		initialX: $$props.initialX,
		initialY: $$props.initialY,
		data: $$props.data,
		key: $$props.key,
		center: $$props.center,
		motion: $$props.motion,
		...rest
	}));

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const transitionIn = $.derived(() => $$props.transitionIn ?? c.defaultTransitionIn);
	const transitionInParams = $.derived(() => $$props.transitionInParams ?? c.defaultTransitionInParams);

	const handleTouchMove = (e) => {
		if (preventTouchMove()) {
			e.preventDefault();
		}

		$$props.ontouchmove?.(e);
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				var g = root();

				$.attribute_effect(g, () => ({
					class: ['lc-group-g', $$props.class],
					opacity: $$props.opacity,
					...rest,
					ontouchmove: handleTouchMove,
					[$.STYLE]: {
						transform: `translate(${$.get(item).x ?? ''}px, ${$.get(item).y ?? ''}px)`
					}
				}));

				var node_2 = $.child(g);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.reset(g);
				$.append($$anchor, g);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var g_1 = root();

			$.attribute_effect(g_1, () => ({
				class: ['lc-group-g', $$props.class],
				opacity: $$props.opacity,
				...rest,
				ontouchmove: handleTouchMove,
				[$.STYLE]: { transform: c.transform }
			}));

			var node_3 = $.child(g_1);

			$.snippet(node_3, () => $$props.children ?? $.noop);
			$.reset(g_1);
			$.bind_this(g_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.transition(1, g_1, () => $.get(transitionIn), () => $.get(transitionInParams));
			$.append($$anchor, g_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}