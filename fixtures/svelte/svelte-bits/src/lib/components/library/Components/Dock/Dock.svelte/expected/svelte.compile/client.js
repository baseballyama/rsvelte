import 'svelte/internal/disclose-version';
import { motionValue, animate, transform } from 'motion';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export function dockItem(node, params) {
	let {
		mouseX,
		spring,
		distance,
		baseItemSize,
		magnification,
		setSize
	} = params;

	const target = motionValue(baseItemSize);
	const animated = motionValue(baseItemSize);
	let currentAnim = null;

	const compute = (mx) => {
		const rect = node.getBoundingClientRect();
		const md = mx - rect.x - baseItemSize / 2;

		return transform([-distance, 0, distance], [baseItemSize, magnification, baseItemSize])(md);
	};

	const offTarget = target.on('change', (v) => {
		currentAnim?.stop?.();
		currentAnim = animate(animated, v, { type: 'spring', ...spring });
	});

	const offAnimated = animated.on('change', (v) => setSize(v));
	const offMouse = mouseX.on('change', (mx) => target.set(compute(mx)));

	target.set(compute(mouseX.get()));

	return {
		update(next) {
			distance = next.distance;
			baseItemSize = next.baseItemSize;
			magnification = next.magnification;
			spring = next.spring;
		},

		destroy() {
			offTarget();
			offAnimated();
			offMouse();
			currentAnim?.stop?.();
		}
	};
}

var root = $.from_html(`<div role="tooltip" class="absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#120F17] px-2 py-0.5 text-xs text-white"> </div>`);
var root_1 = $.from_html(`<div tabindex="0" role="button" aria-haspopup="true"><div class="flex items-center justify-center"><!></div> <!></div>`);
var root_2 = $.from_html(`<div class="mx-2 flex max-w-full items-center"><div role="toolbar" tabindex="-1" aria-label="Application dock"></div></div>`);

export default function Dock($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		spring = $.prop($$props, 'spring', 19, () => ({ mass: 0.1, stiffness: 150, damping: 12 })),
		magnification = $.prop($$props, 'magnification', 3, 70),
		distance = $.prop($$props, 'distance', 3, 200),
		panelHeight = $.prop($$props, 'panelHeight', 3, 64),
		dockHeight = $.prop($$props, 'dockHeight', 3, 256),
		baseItemSize = $.prop($$props, 'baseItemSize', 3, 50);

	const maxHeight = $.derived(() => Math.max(dockHeight(), magnification() + magnification() / 2 + 4));
	const mouseX = motionValue(Infinity);
	const isHovered = motionValue(0);
	let outerHeight = $.state($.proxy(panelHeight()));

	// Per-item size state (parallel array indexed by item index)
	let sizes = $.state($.proxy($$props.items.map(() => baseItemSize())));

	$.user_effect(() => {
		// keep array length in sync
		if ($.get(sizes).length !== $$props.items.length) {
			$.set(sizes, $$props.items.map(() => baseItemSize()), true);
		}
	});

	// Per-item label visibility
	let labelVisible = $.state($.proxy($$props.items.map(() => false)));

	$.user_effect(() => {
		if ($.get(labelVisible).length !== $$props.items.length) {
			$.set(labelVisible, $$props.items.map(() => false), true);
		}
	});

	onMount(() => {
		const heightTarget = motionValue(panelHeight());
		const heightAnimated = motionValue(panelHeight());
		let curAnim = null;

		const offTarget = heightTarget.on('change', (v) => {
			curAnim?.stop?.();
			curAnim = animate(heightAnimated, v, { type: 'spring', ...spring() });
		});

		const offAnim = heightAnimated.on('change', (v) => $.set(outerHeight, v, true));

		const offHover = isHovered.on('change', (v) => {
			heightTarget.set(transform([0, 1], [panelHeight(), $.get(maxHeight)])(v));
		});

		return () => {
			offTarget();
			offAnim();
			offHover();
			curAnim?.stop?.();
		};
	});

	var div = root_2();
	let styles;
	var div_1 = $.child(div);
	let styles_1;

	$.each(div_1, 21, () => $$props.items, $.index, ($$anchor, item, i) => {
		var div_2 = root_1();
		let styles_2;
		var div_3 = $.child(div_2);
		var node_1 = $.child(div_3);

		$.snippet(node_1, () => $.get(item).icon);
		$.reset(div_3);

		var node_2 = $.sibling(div_3, 2);

		{
			var consequent = ($$anchor) => {
				var div_4 = root();

				$.set_style(div_4, '', {}, {
					transform: 'translateX(-50%) translateY(-10px)',
					opacity: '1',
					transition: 'opacity 200ms ease, transform 200ms ease'
				});

				var text = $.only_child(div_4, true);

				$.template_effect(() => $.set_text(text, $.get(item).label));
				$.append($$anchor, div_4);
			};

			$.if(node_2, ($$render) => {
				if ($.get(labelVisible)[i]) $$render(consequent);
			});
		}

		$.reset(div_2);

		$.action(div_2, ($$node, $$action_arg) => dockItem?.($$node, $$action_arg), () => ({
			mouseX,
			spring: spring(),
			distance: distance(),
			baseItemSize: baseItemSize(),
			magnification: magnification(),
			setSize: (v) => $.get(sizes)[i] = v
		}));

		$.template_effect(() => {
			$.set_class(div_2, 1, `relative inline-flex items-center justify-center rounded-full bg-[#120F17] border-neutral-700 border-2 shadow-md cursor-pointer ${$.get(item).class ?? '' ?? ''}`);
			$.set_attribute(div_2, 'aria-label', $.get(item).label);

			styles_2 = $.set_style(div_2, '', styles_2, {
				width: `${$.get(sizes)[i] ?? baseItemSize() ?? ''}px`,
				height: `${$.get(sizes)[i] ?? baseItemSize() ?? ''}px`
			});
		});

		$.event('mouseenter', div_2, () => $.get(labelVisible)[i] = true);
		$.event('mouseleave', div_2, () => $.get(labelVisible)[i] = false);
		$.event('focus', div_2, () => $.get(labelVisible)[i] = true);
		$.event('blur', div_2, () => $.get(labelVisible)[i] = false);
		$.delegated('click', div_2, () => $.get(item).onClick?.());

		$.delegated('keydown', div_2, (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				$.get(item).onClick?.();
			}
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		styles = $.set_style(div, '', styles, {
			height: `${$.get(outerHeight) ?? ''}px`,
			'scrollbar-width': 'none'
		});

		$.set_class(div_1, 1, `absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-neutral-700 border-2 pb-2 px-4 ${className() ?? ''}`);
		styles_1 = $.set_style(div_1, '', styles_1, { height: `${panelHeight() ?? ''}px` });
	});

	$.delegated('mousemove', div_1, (e) => {
		isHovered.set(1);
		mouseX.set(e.pageX);
	});

	$.event('mouseleave', div_1, () => {
		isHovered.set(0);
		mouseX.set(Infinity);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousemove', 'click', 'keydown']);