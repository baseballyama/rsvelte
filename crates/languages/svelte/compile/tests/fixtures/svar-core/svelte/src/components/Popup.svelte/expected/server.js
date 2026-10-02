import * as $ from 'svelte/internal/server';
import { clickOutside, calculatePosition, getAbsParent } from "@svar-ui/lib-dom";
import { onMount } from "svelte";

export default function Popup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			left = 0,
			top = 0,
			at = "bottom",
			parent = null,
			width = "auto",
			css = "",
			oncancel,
			children,
			trackScroll = false
		} = $$props;

		let self = null;
		let x = 0;
		let y = 0;
		let w = "auto";
		let portal;

		function getWidth(calcWidth) {
			if (parent && (width + "").indexOf("%") > -1) {
				return width.replace(/(\d+)%/, (match, value) => {
					value = value * parent.offsetWidth / 100 + "px";

					return width.replace(match, value);
				});
			}

			return width && width !== "auto" ? width : calcWidth;
		}

		function updatePosition() {
			if (!self) return;

			const result = calculatePosition(self, parent, at, left, top);

			if (result) {
				x = result.x;
				y = result.y;
				w = getWidth(result.width);
			}
		}

		function onScroll(e) {
			if (oncancel && e.target !== portal && self && !self.contains(e.target)) oncancel(e);
		}

		onMount(() => {
			let resizeObserver;

			requestAnimationFrame(() => {
				updatePosition();

				if (trackScroll) {
					portal = getAbsParent(self);

					if (portal) portal.addEventListener("scroll", onScroll, true);
				}

				if (parent) {
					resizeObserver = new ResizeObserver(updatePosition);
					resizeObserver.observe(parent);
				}
			});

			return () => {
				if (trackScroll && portal) portal.removeEventListener("scroll", onScroll, true);
				if (resizeObserver) resizeObserver.disconnect();
			};
		});

		function down(e) {
			oncancel && oncancel(e);
		}

		$$renderer.push(`<div${$.attr_class(`wx-popup ${$.stringify(css)}`, 'svelte-18sx8fa')}${$.attr_style(`position:absolute;top:${$.stringify(y)}px;left:${$.stringify(x)}px;width:${$.stringify(w)};`)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}