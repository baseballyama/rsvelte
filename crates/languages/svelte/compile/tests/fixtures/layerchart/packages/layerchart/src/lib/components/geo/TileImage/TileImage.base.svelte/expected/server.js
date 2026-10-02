import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { tileCache } from './TileImage.shared.svelte.js';

export default function TileImage_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Text,
			x,
			y,
			z,
			tx,
			ty,
			scale,
			disableCache = false,
			debug = false,
			url,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let href = disableCache ? url(x, y, z) : '';

		function loadImage(url) {
			const key = url;

			if (tileCache.has(key)) {
				tileCache.get(key)?.then((dataUri) => {
					href = dataUri;
				}).catch(() => {});
			} else {
				const promise = new Promise((resolve, reject) => {
					const img = new Image();

					img.crossOrigin = 'anonymous';

					img.onload = function () {
						var canvas = document.createElement('canvas');
						var context = canvas.getContext('2d');

						// @ts-expect-error
						canvas.height = this.naturalHeight;

						// @ts-expect-error
						canvas.width = this.naturalWidth;

						// @ts-expect-error
						context.drawImage(this, 0, 0);

						var dataUri = canvas.toDataURL('image/jpeg');

						href = dataUri;
						resolve(dataUri);
					};

					img.onerror = (err) => {
						tileCache.delete(key);
						reject(err);
					};

					img.src = url;
				});

				tileCache.set(key, promise);
			}
		}

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<image${$.attributes(
				{
					href,
					x: (x + tx) * scale - 0.5,
					y: (y + ty) * scale - 0.5,
					width: scale + 1,
					height: scale + 1,
					...extractLayerProps(restProps, 'lc-tile-image-lower')
				},
				void 0,
				void 0,
				void 0,
				3
			)}></image><image${$.attributes(
				{
					href,
					x: (x + tx) * scale,
					y: (y + ty) * scale,
					width: scale,
					height: scale,
					...extractLayerProps(restProps, 'lc-tile-image')
				},
				void 0,
				void 0,
				void 0,
				3
			)}></image>`);
		}

		$$renderer.push(`<!---->`);

		if (debug) {
			$$renderer.push(`<!--[0--><rect${$.attr('x', (x + tx) * scale)}${$.attr('y', (y + ty) * scale)}${$.attr('width', scale)}${$.attr('height', scale)} class="lc-tile-image-debug-rect"></rect>`);

			if (Text) {
				$$renderer.push('<!--[-->');

				Text($$renderer, {
					x: (x + tx) * scale,
					y: (y + ty) * scale,
					verticalAnchor: 'start',
					dx: 2,
					dy: -2,
					value: `${$.stringify(x)}-${$.stringify(y)}-${$.stringify(z)}`,
					class: 'lc-tile-image-debug-text'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}