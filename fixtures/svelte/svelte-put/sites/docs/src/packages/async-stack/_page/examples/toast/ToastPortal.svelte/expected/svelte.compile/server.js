import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { fly } from 'svelte/transition';
import { toastStack } from './toast';

export default function ToastPortal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const MAX_ITEMS = 3;
		const SCALE_STEP = 0.05;
		const EXPAND_REM_GAP = 1;
		const TRANSLATE_REM_STEP = 1;

		/** if render top down, 1, if bottom up, -1 */
		const Y_SIGN = -1;

		let expanded = false;
		let visibleItems = $.derived(() => toastStack.items.slice(-3));
		let liMap = {};

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

				acc[id] = index >= toastStack.items.length - MAX_ITEMS ? 1 : 0;

				return acc;
			},
			{}
		));

		let liTransformMap = $.derived(() => Object.entries(liMap).reduce(
			(acc, [id, li]) => {
				const index = parseInt(li.dataset.index ?? '0') || 0;

				if (!expanded) {
					const delta = Math.min(toastStack.items.length - index, MAX_ITEMS + 1) - 1;
					const scaleX = 1 - delta * SCALE_STEP;
					const liHeight = liHeightMap()[id] ?? 0;
					let topLiHeight = 0;
					const topItem = toastStack.items.at(-1);

					if (topItem) topLiHeight = liHeightMap()[topItem.config.id] ?? 0;

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

				for (let i = toastStack.items.length - 1; i > index; i--) {
					accumulatedHeight += liHeightMap()[toastStack.items[i].config.id] ?? 0;
					rem += EXPAND_REM_GAP;
				}

				let scale = index < toastStack.items.length - MAX_ITEMS ? 1 - MAX_ITEMS * SCALE_STEP : 1;

				acc[id] = `scale(${scale}) translateY(calc(${Y_SIGN * accumulatedHeight}px + ${Y_SIGN * rem}rem))`;

				return acc;
			},
			{}
		));

		const olHeight = $.derived(() => {
			if (!expanded) return 'auto';

			const contentPx = visibleItems().reduce(
				(acc, item) => {
					acc += (liHeightMap()[item.config.id] ?? 0) + EXPAND_REM_GAP;

					return acc;
				},
				0
			);

			const remGap = EXPAND_REM_GAP * (visibleItems().length - 1);

			return `calc(${contentPx}px + ${remGap}rem)`;
		});

		function onMouseEnter() {
			expanded = true;
			toastStack.pause(); // pause all items;
		}

		function onMouseLeave() {
			expanded = false;
			toastStack.resume(); // resume all items;
		}

		$$renderer.push(`<ol class="z-notification tablet:bottom-10 tablet:right-10 fixed bottom-2 right-4 grid content-end items-end svelte-1yu8qpq"${$.attr('data-expanded', expanded)}${$.attr_style('', { height: olHeight() })}><!--[-->`);

		const each_array = $.ensure_array_like(toastStack.items);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let notification = each_array[index];
			const id = notification.config.id;

			$$renderer.push(`<li${$.attr('data-index', index)} class="w-full origin-center svelte-1yu8qpq"${$.attr_style('', { opacity: liOpacityMap()[id], transform: liTransformMap()[id] })}></li>`);
		}

		$$renderer.push(`<!--]--></ol>`);
	});
}