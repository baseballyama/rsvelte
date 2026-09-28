import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import Ripple from './Ripple.svelte';

var root = $.from_html(`<button class="svelte-1aw83mz"><span class="svelte-1aw83mz"><!></span> <svg class="svelte-1aw83mz"></svg></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	const $ripples = () => $.store_get(ripples, '$ripples', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// @ts-nocheck
	let rippleBlur = $.prop($$props, 'rippleBlur', 3, 0),
		speed = $.prop($$props, 'speed', 3, 900),
		color = $.prop($$props, 'color', 3, '#fff'),
		fontSize = $.prop($$props, 'fontSize', 3, '.875rem'),
		bgColor = $.prop($$props, 'bgColor', 3, '74, 64, 212'),
		bgHover = $.prop($$props, 'bgHover', 19, bgColor),
		bgActive = $.prop($$props, 'bgActive', 19, bgColor),
		rippleColor = $.prop($$props, 'rippleColor', 3, '#838de7'),
		round = $.prop($$props, 'round', 3, '0.2rem'),
		height = $.prop($$props, 'height', 3, 36),
		width = $.prop($$props, 'width', 3, 140),
		sizeIn = $.prop($$props, 'sizeIn', 3, 20),
		opacityIn = $.prop($$props, 'opacityIn', 3, 0.5),
		shadow = $.prop($$props, 'shadow', 3, 5),
		shadowHover = $.prop($$props, 'shadowHover', 3, 5),
		shadowActive = $.prop($$props, 'shadowActive', 3, 2),
		disabled = $.prop($$props, 'disabled', 3, false);

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

	let coords = $.proxy({ x: 50, y: 50 });
	let offsetX = $.derived(() => Math.abs(w / 2 - coords.x));
	let offsetY = $.derived(() => Math.abs(h / 2 - coords.y));
	let deltaX = $.derived(() => w / 2 + $.get(offsetX));
	let deltaY = $.derived(() => h / 2 + $.get(offsetY));
	let scale_ratio = $.derived(() => Math.sqrt(Math.pow($.get(deltaX), 2.2) + Math.pow($.get(deltaY), 2.2)));

	const debounce = () => {
		clearTimeout(timer);

		timer = setTimeout(
			() => {
				ripples.clear();
			},
			speed() + speed() * 2
		);
	};

	let touch;

	function handleClick(e, type) {
		if (type === 'touch') {
			touch = true;

			ripples.add({
				x: e.pageX - locationX,
				y: e.pageY - locationY,
				size: $.get(scale_ratio)
			});
		} else {
			if (!touch) {
				ripples.add({
					x: e.clientX - locationX,
					y: e.clientY - locationY,
					size: $.get(scale_ratio)
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

	var $$exports = { ripples };
	var button = root();
	var span = $.child(button);
	var node = $.child(span);

	$.snippet(node, () => $$props.children);
	$.reset(span);

	var svg = $.sibling(span, 2);

	$.each(svg, 5, $ripples, (ripple) => ripple, ($$anchor, ripple) => {
		Ripple($$anchor, {
			get x() {
				return $.get(ripple).x;
			},

			get y() {
				return $.get(ripple).y;
			},

			get size() {
				return $.get(ripple).size;
			},

			get speed() {
				return speed();
			},

			get sizeIn() {
				return sizeIn();
			},

			get opacityIn() {
				return opacityIn();
			},

			get rippleBlur() {
				return rippleBlur();
			}
		});
	});

	$.reset(svg);
	$.reset(button);
	$.bind_this(button, ($$value) => rippleBtn = $$value, () => rippleBtn);

	$.template_effect(() => {
		button.disabled = disabled();
		$.set_style(button, `--color: ${color() ?? ''};--font-size: ${fontSize() ?? ''};--bg-color: ${bgColor() ?? ''};--bg-hover: ${bgHover() ?? ''};--bg-active: ${bgActive() ?? ''};--radius: ${round() ?? ''};--ripple: ${rippleColor() ?? ''};--height: ${height() ?? ''}px;--width: ${width() ?? ''}px;--shadow: ${shadows[shadow()] ?? ''};--shadow-h: ${shadows[shadowHover()] ?? ''};--shadow-a: ${shadows[shadowActive()] ?? ''}`);
	});

	$.delegated('click', button, handleClick);
	$.delegated('touchstart', button, onTouchStart, void 0, true);
	$.delegated('mousedown', button, onMouseDown);
	$.append($$anchor, button);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['click', 'touchstart', 'mousedown']);