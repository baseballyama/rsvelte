import * as $ from 'svelte/internal/server';
import { ImageState, imageMarkInfo } from './Image.shared.svelte.js';

export default function Image_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new ImageState(() => rest);

		// --- Canvas image cache ---
		const imageCache = new Map();

		let loadedImageCount = 0;

		function getOrLoadImage(src) {
			const cached = imageCache.get(src);

			if (cached?.complete) return cached;
			if (cached) return null; // Still loading

			const img = new window.Image();

			if (rest.crossOrigin) img.crossOrigin = rest.crossOrigin;

			img.src = src;

			img.onload = () => {
				loadedImageCount++;
			};

			imageCache.set(src, img);

			return img.complete ? img : null;
		}

		function canvasRender(ctx) {
			if (c.dataMode) {
				for (const item of c.resolvedItems) {
					const resolvedHrefValue = c.resolveHref(item.d);

					if (!resolvedHrefValue) continue;

					const img = getOrLoadImage(resolvedHrefValue);

					if (!img) continue;

					const renderX = item.x - item.width / 2;
					const renderY = item.y - item.height / 2;

					ctx.save();

					if (rest.opacity !== undefined) {
						ctx.globalAlpha = rest.opacity;
					}

					if (item.rotate) {
						ctx.translate(item.x, item.y);
						ctx.rotate(item.rotate * Math.PI / 180);
						ctx.translate(-item.x, -item.y);
					}

					if (item.r !== undefined) {
						ctx.beginPath();
						ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
						ctx.clip();
					}

					ctx.drawImage(img, renderX, renderY, item.width, item.height);
					ctx.restore();
				}
			} else {
				const hrefValue = typeof rest.href === 'string' ? rest.href : undefined;

				if (!hrefValue) return;

				const img = getOrLoadImage(hrefValue);

				if (!img) return;

				const cx = c.motionX;
				const cy = c.motionY;
				const w = c.motionWidth;
				const h = c.motionHeight;
				const renderX = cx - w / 2;
				const renderY = cy - h / 2;

				ctx.save();

				if (rest.opacity !== undefined) {
					ctx.globalAlpha = rest.opacity;
				}

				if (c.pixelRotate) {
					ctx.translate(cx, cy);
					ctx.rotate(c.pixelRotate * Math.PI / 180);
					ctx.translate(-cx, -cy);
				}

				if (c.pixelR !== undefined) {
					ctx.beginPath();
					ctx.arc(cx, cy, c.pixelR, 0, 2 * Math.PI);
					ctx.clip();
				}

				ctx.drawImage(img, renderX, renderY, w, h);
				ctx.restore();
			}
		}

		c.chartCtx.registerComponent({
			name: 'Image',
			kind: 'mark',
			markInfo: () => imageMarkInfo(rest, c.dataMode),
			canvasRender: {
				render: canvasRender,
				events: {
					click: rest.onclick,
					pointerdown: rest.onpointerdown,
					pointerenter: rest.onpointerenter,
					pointermove: rest.onpointermove,
					pointerleave: rest.onpointerleave
				},

				deps: () => [
					c.dataMode,
					c.dataMode ? c.resolvedItems : null,
					c.motionX,
					c.motionY,
					c.motionWidth,
					c.motionHeight,
					rest.href,
					rest.opacity,
					rest.class,
					rest.style,
					loadedImageCount
				]
			}
		});
	});
}