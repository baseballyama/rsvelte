import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import Ripple from './Ripple.svelte';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// @ts-nocheck
		let {
			rippleBlur = 0,
			speed = 900,
			color = '#fff',
			fontSize = '.875rem',
			bgColor = '74, 64, 212',
			bgHover = bgColor,
			bgActive = bgColor,
			rippleColor = '#838de7',
			round = '0.2rem',
			height = 36,
			width = 140,
			sizeIn = 20,
			opacityIn = 0.5,
			shadow = 5,
			shadowHover = 5,
			shadowActive = 2,
			disabled = false,
			children
		} = $$props;

		const shadows = {
			none: 'none',
			1: '0 0 0 1px rgba(0, 0, 0, 0.05)',
			2: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
			3: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
			4: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			5: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
			6: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			7: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
		};

		function handleRipple() {
			const ripples = writable([]);

			return {
				subscribe: ripples.subscribe,
				add: (item) => {
					ripples.update((items) => {
						return [...items, item];
					});
				},

				clear: () => {
					ripples.update(() => {
						return [];
					});
				}
			};
		}

		const ripples = handleRipple();
		let rect;
		let rippleBtn;
		let w;
		let h;

		let //	offsetX: number,
		//	offsetY: number,
		// deltaX: number,
		// deltaY: number,
		locationY;

		let locationX;

		let // scale_ratio: number,
		timer;

		let coords = { x: 50, y: 50 };
		let offsetX = $.derived(() => Math.abs(w / 2 - coords.x));
		let offsetY = $.derived(() => Math.abs(h / 2 - coords.y));
		let deltaX = $.derived(() => w / 2 + offsetX());
		let deltaY = $.derived(() => h / 2 + offsetY());
		let scale_ratio = $.derived(() => Math.sqrt(Math.pow(deltaX(), 2.2) + Math.pow(deltaY(), 2.2)));

		const debounce = () => {
			clearTimeout(timer);

			timer = setTimeout(
				() => {
					ripples.clear();
				},
				speed + speed * 2
			);
		};

		let touch;

		function handleClick(e, type) {
			if (type === 'touch') {
				touch = true;

				ripples.add({
					x: e.pageX - locationX,
					y: e.pageY - locationY,
					size: scale_ratio()
				});
			} else {
				if (!touch) {
					ripples.add({
						x: e.clientX - locationX,
						y: e.clientY - locationY,
						size: scale_ratio()
					});
				}

				touch = false;
			}

			debounce();
		}

		onMount(() => {
			w = rippleBtn.offsetWidth;
			h = rippleBtn.offsetHeight;
			rect = rippleBtn.getBoundingClientRect();
			locationY = rect.top;
			locationX = rect.left;
		});

		function onTouchStart(e) {
			handleClick(e.touches[0], 'touch');
		}

		function onMouseDown(e) {
			handleClick(e, 'click');
		}

		$$renderer.push(`<button${$.attr('disabled', disabled, true)}${$.attr_style(`--color: ${$.stringify(color)};--font-size: ${$.stringify(fontSize)};--bg-color: ${$.stringify(bgColor)};--bg-hover: ${$.stringify(bgHover)};--bg-active: ${$.stringify(bgActive)};--radius: ${$.stringify(round)};--ripple: ${$.stringify(rippleColor)};--height: ${$.stringify(height)}px;--width: ${$.stringify(width)}px;--shadow: ${$.stringify(shadows[shadow])};--shadow-h: ${$.stringify(shadows[shadowHover])};--shadow-a: ${$.stringify(shadows[shadowActive])}`)} class="svelte-1aw83mz"><span class="svelte-1aw83mz">`);
		children($$renderer);
		$$renderer.push(`<!----></span> <svg class="svelte-1aw83mz"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$ripples', ripples));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let ripple = each_array[$$index];

			Ripple($$renderer, {
				x: ripple.x,
				y: ripple.y,
				size: ripple.size,
				speed,
				sizeIn,
				opacityIn,
				rippleBlur
			});
		}

		$$renderer.push(`<!--]--></svg></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ripples });
	});
}