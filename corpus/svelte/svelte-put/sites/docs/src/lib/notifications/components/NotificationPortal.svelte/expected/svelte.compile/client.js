import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { fly } from 'svelte/transition';
import { NotificationContext } from '../context.svelte';

var root = $.from_html(`<li class="w-full origin-top svelte-1u9aenz"></li>`);
var root_1 = $.from_html(`<ol class="z-notification tablet:top-10 tablet:right-10 fixed right-4 top-2 grid content-start items-start svelte-1u9aenz"></ol>`);

export default function NotificationPortal($$anchor, $$props) {
	$.push($$props, true);

	const MAX_ITEMS = 3;
	const SCALE_STEP = 0.05;
	const EXPAND_REM_GAP = 1;
	const TRANSLATE_REM_STEP = 1;

	/** if render top down, 1, if bottom up, -1 */
	const Y_SIGN = 1;

	const { stack } = NotificationContext.get();
	let expanded = $.state(false);
	let visibleItems = $.derived(() => stack.items.slice(-3));
	let liMap = $.proxy({});

	let liHeightMap = $.derived(() => Object.entries(liMap).reduce(
		(acc, [id, li]) => {
			acc[id] = li.clientHeight;

			return acc;
		},
		{}
	));

	let liOpacityMap = $.derived(() => Object.entries(liMap).reduce(
		(acc, [id, li]) => {
			const index = parseInt(li.dataset.index ?? '0') || 0;

			acc[id] = index >= stack.items.length - MAX_ITEMS ? 1 : 0;

			return acc;
		},
		{}
	));

	let liTransformMap = $.derived(() => Object.entries(liMap).reduce(
		(acc, [id, li]) => {
			const index = parseInt(li.dataset.index ?? '0') || 0;

			if (!$.get(expanded)) {
				const delta = Math.min(stack.items.length - index, MAX_ITEMS + 1) - 1;
				const scaleX = 1 - delta * SCALE_STEP;
				const liHeight = $.get(liHeightMap)[id] ?? 0;
				let topLiHeight = 0;
				const topItem = stack.items.at(-1);

				if (topItem) topLiHeight = $.get(liHeightMap)[topItem.config.id] ?? 0;

				let scaleY = scaleX;
				let yPx = 0;

				if (liHeight >= topLiHeight) {
					scaleY = topLiHeight / liHeight || 1;
				} else {
					yPx = Y_SIGN * (topLiHeight - liHeight * scaleY);
				}

				const yRem = Y_SIGN * delta * TRANSLATE_REM_STEP / scaleY;

				acc[id] = `scaleX(${scaleX}) scaleY(${scaleY}) translateY(calc(${yPx}px + ${yRem}rem))`;

				return acc;
			}

			let accumulatedHeight = 0;
			let rem = 0;

			for (let i = stack.items.length - 1; i > index; i--) {
				accumulatedHeight += $.get(liHeightMap)[stack.items[i].config.id] ?? 0;
				rem += EXPAND_REM_GAP;
			}

			let scale = index < stack.items.length - MAX_ITEMS ? 1 - MAX_ITEMS * SCALE_STEP : 1;

			acc[id] = `scale(${scale}) translateY(calc(${Y_SIGN * accumulatedHeight}px + ${Y_SIGN * rem}rem))`;

			return acc;
		},
		{}
	));

	const olHeight = $.derived(() => {
		if (!$.get(expanded)) return 'auto';

		const contentPx = $.get(visibleItems).reduce(
			(acc, item) => {
				acc += ($.get(liHeightMap)[item.config.id] ?? 0) + EXPAND_REM_GAP;

				return acc;
			},
			0
		);

		const remGap = EXPAND_REM_GAP * ($.get(visibleItems).length - 1);

		return `calc(${contentPx}px + ${remGap}rem)`;
	});

	function onMouseEnter() {
		$.set(expanded, true);
		stack.pause(); // pause all items;
	}

	function onMouseLeave() {
		$.set(expanded, false);
		stack.resume(); // resume all items;
	}

	var ol = root_1();
	let styles;

	$.each(ol, 31, () => stack.items, (notification) => notification.config.id, ($$anchor, notification, index) => {
		const id = $.derived(() => $.get(notification).config.id);
		var li_1 = root();
		let styles_1;

		$.action(li_1, ($$node, $$action_arg) => stack.actions.render?.($$node, $$action_arg), () => $.get(notification));

		$.template_effect(() => {
			$.set_attribute(li_1, 'data-index', $.get(index));

			styles_1 = $.set_style(li_1, '', styles_1, {
				opacity: $.get(liOpacityMap)[$.get(id)],
				transform: $.get(liTransformMap)[$.get(id)]
			});
		});

		$.event('stackitemmount', li_1, (e) => {
			liMap[$.get(id)] = e.target;
		});

		$.event('stackitemunmount', li_1, () => {
			delete liMap[$.get(id)];
		});

		$.animation(li_1, () => flip, () => ({ duration: 200 }));
		$.transition(3, li_1, () => fly, () => ({ duration: 200, y: '-2rem' }));
		$.append($$anchor, li_1);
	});

	$.reset(ol);

	$.template_effect(() => {
		$.set_attribute(ol, 'data-expanded', $.get(expanded));
		styles = $.set_style(ol, '', styles, { height: $.get(olHeight) });
	});

	$.event('mouseenter', ol, onMouseEnter);
	$.event('mouseleave', ol, onMouseLeave);
	$.append($$anchor, ol);
	$.pop();
}