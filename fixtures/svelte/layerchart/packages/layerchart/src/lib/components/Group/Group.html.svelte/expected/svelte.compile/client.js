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

var root = $.from_html(`<div><!></div>`);

export default function Group_html($$anchor, $$props) {
	$.push($$props, true);

	let preventTouchMove = $.prop($$props, 'preventTouchMove', 3, false),
		refProp = $.prop($$props, 'ref', 15),
		// Internal-only: pulled out so `{...rest}` doesn't pollute DOM attrs.
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
				var div = root();

				$.attribute_effect(
					div,
					() => ({
						...rest,
						class: ['lc-group-div', $$props.class],
						ontouchmove: handleTouchMove,
						[$.STYLE]: {
							transform: `translate(${$.get(item).x ?? ''}px, ${$.get(item).y ?? ''}px)`,
							opacity: $$props.opacity
						}
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1w6wis'
				);

				var node_2 = $.child(div);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_1 = root();

			$.attribute_effect(
				div_1,
				() => ({
					...rest,
					class: ['lc-group-div', $$props.class],
					ontouchmove: handleTouchMove,
					[$.STYLE]: { transform: c.transform, opacity: $$props.opacity }
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1w6wis'
			);

			var node_3 = $.child(div_1);

			$.snippet(node_3, () => $$props.children ?? $.noop);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.transition(1, div_1, () => $.get(transitionIn), () => $.get(transitionInParams));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}