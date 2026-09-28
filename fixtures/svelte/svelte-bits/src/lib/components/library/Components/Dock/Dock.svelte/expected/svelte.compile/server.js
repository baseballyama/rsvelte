import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { motionValue, animate, transform } from 'motion';

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

export default function Dock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			class: className = '',
			spring = { mass: 0.1, stiffness: 150, damping: 12 },
			magnification = 70,
			distance = 200,
			panelHeight = 64,
			dockHeight = 256,
			baseItemSize = 50
		} = $$props;

		const maxHeight = $.derived(() => Math.max(dockHeight, magnification + magnification / 2 + 4));
		const mouseX = motionValue(Infinity);
		const isHovered = motionValue(0);
		let outerHeight = panelHeight;

		// Per-item size state (parallel array indexed by item index)
		let sizes = items.map(() => baseItemSize);

		// keep array length in sync
		// Per-item label visibility
		let labelVisible = items.map(() => false);

		onMount(() => {
			const heightTarget = motionValue(panelHeight);
			const heightAnimated = motionValue(panelHeight);
			let curAnim = null;

			const offTarget = heightTarget.on('change', (v) => {
				curAnim?.stop?.();
				curAnim = animate(heightAnimated, v, { type: 'spring', ...spring });
			});

			const offAnim = heightAnimated.on('change', (v) => outerHeight = v);

			const offHover = isHovered.on('change', (v) => {
				heightTarget.set(transform([0, 1], [panelHeight, maxHeight()])(v));
			});

			return () => {
				offTarget();
				offAnim();
				offHover();
				curAnim?.stop?.();
			};
		});

		$$renderer.push(`<div class="mx-2 flex max-w-full items-center"${$.attr_style('', {
			height: `${$.stringify(outerHeight)}px`,
			'scrollbar-width': 'none'
		})}><div${$.attr_class(`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-neutral-700 border-2 pb-2 px-4 ${$.stringify(className)}`)} role="toolbar" tabindex="-1" aria-label="Application dock"${$.attr_style('', { height: `${$.stringify(panelHeight)}px` })}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div${$.attr_class(`relative inline-flex items-center justify-center rounded-full bg-[#120F17] border-neutral-700 border-2 shadow-md cursor-pointer ${$.stringify(item.class ?? '')}`)} tabindex="0" role="button" aria-haspopup="true"${$.attr('aria-label', item.label)}${$.attr_style('', {
				width: `${$.stringify(sizes[i] ?? baseItemSize)}px`,
				height: `${$.stringify(sizes[i] ?? baseItemSize)}px`
			})}><div class="flex items-center justify-center">`);

			item.icon($$renderer);
			$$renderer.push(`<!----></div> `);

			if (labelVisible[i]) {
				$$renderer.push(`<!--[0--><div role="tooltip" class="absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#120F17] px-2 py-0.5 text-xs text-white"${$.attr_style('', {
					transform: 'translateX(-50%) translateY(-10px)',
					opacity: '1',
					transition: 'opacity 200ms ease, transform 200ms ease'
				})}>${$.escape(item.label)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}