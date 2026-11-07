import * as $ from 'svelte/internal/server';
import Thumbnail from "./Thumbnail.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { thumbnails } from "./theme";

export default function Thumbnails($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			images = [],
			index = void 0,
			ariaLabel = "Click to view image",
			imgClass,
			throttleDelay = 650,
			class: className
		} = $$props;

		const theme = $.derived(() => getTheme("thumbnails"));

		// Initialize so the first click is never throttled
		let lastClickedAt = -Infinity;

		const btnClick = (newIndex) => {
			const now = Date.now();

			if (now - lastClickedAt < throttleDelay) {
				console.warn("Thumbnail action throttled");

				return;
			}

			lastClickedAt = now;
			index = newIndex;
		};

		$$renderer.push(`<div${$.attr_class($.clsx(thumbnails({ class: clsx(theme(), className) })))}><!--[-->`);

		const each_array = $.ensure_array_like(images);

		for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
			let image = each_array[idx];
			const selected = index === idx;

			$$renderer.push(`<button${$.attr('aria-label', ariaLabel)}${$.attr('aria-current', selected ? "true" : undefined)}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { image, selected, imgClass: clsx(imgClass), Thumbnail });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
				Thumbnail($$renderer, $.spread_props([image, { selected, class: clsx(imgClass) }]));
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { index });
	});
}