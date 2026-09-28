import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { getComputedStyles, renderText } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { degreesToRadians } from '$lib/utils/math.js';
import { TextState, textMarkInfo, getPixelValue } from './Text.shared.svelte.js';

export default function Text_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new TextState(() => rest);

		function getTextStyles(
			styleOverrides,
			itemFill,
			itemStroke,
			itemFillOpacity,
			itemStrokeWidth,
			itemOpacity,
			itemClass
		) {
			return styleOverrides
				? merge(
					{
						styles: { strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth }
					},
					styleOverrides
				)
				: {
					// Use raw `rest.fill` / `rest.stroke` (not `staticFill`) so canvas
					// accepts non-string values like `CanvasPattern` / `CanvasGradient`.
					styles: {
						fill: itemFill ?? rest.fill,
						fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
						stroke: itemStroke ?? rest.stroke,
						strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
						opacity: itemOpacity ?? c.staticOpacity,
						paintOrder: 'stroke',
						...rest.fontSize != null
							? {
								fontSize: typeof rest.fontSize === 'number' ? `${rest.fontSize}px` : rest.fontSize
							}
							: {},
						...(rest.textAnchor ?? 'start') !== 'start' ? { textAnchor: rest.textAnchor } : {}
					},
					classes: cls('lc-text', itemClass ?? c.staticClassName),
					style: rest.style
				};
		}

		function render(ctx, styleOverrides) {
			const textAnchor = rest.textAnchor ?? 'start';
			const verticalAnchor = rest.verticalAnchor ?? 'end';
			const lineHeight = rest.lineHeight ?? '1em';
			const dx = rest.dx ?? 0;
			const dy = rest.dy ?? 0;
			const rotate = rest.rotate;
			const x = rest.x;
			const y = rest.y;

			if (c.dataMode) {
				const baseStyles = getTextStyles(styleOverrides);
				const computedStyles = getComputedStyles(ctx.canvas, baseStyles);

				ctx.font = `${computedStyles.fontSize} ${computedStyles.fontFamily}`;

				const textAlign = textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'end' : 'start';

				ctx.textAlign = textAlign;

				for (const item of c.resolvedItems) {
					const text = c.resolveTextValue(item.d);
					const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
					const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
					const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
					const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
					const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
					const resolvedClass = resolveStyleProp(rest.class, item.d);
					const itemStyles = getTextStyles(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);

					ctx.save();

					if (rotate !== undefined) {
						const radians = degreesToRadians(rotate);

						ctx.translate(item.x, item.y);
						ctx.rotate(radians);
						ctx.translate(-item.x, -item.y);
					}

					renderText(
						ctx,
						text,
						{
							x: item.x + getPixelValue(dx),
							y: item.y + getPixelValue(dy) + c.dataModeStartDy
						},
						itemStyles
					);

					ctx.restore();
				}
			} else {
				const styles = getTextStyles(styleOverrides);
				const effectiveLineHeight = getPixelValue(lineHeight);
				const baseY = getPixelValue(c.motionY) + getPixelValue(dy) + getPixelValue(c.startDy);
				const baseX = getPixelValue(c.motionX) + getPixelValue(dx);

				ctx.save();

				if (rotate !== undefined) {
					const centerX = getPixelValue(typeof x === 'function' ? 0 : x ?? 0);
					const centerY = getPixelValue(typeof y === 'function' ? 0 : y ?? 0);
					const radians = degreesToRadians(rotate);

					ctx.translate(centerX, centerY);
					ctx.rotate(radians);
					ctx.translate(-centerX, -centerY);
				}

				const computedStyles = getComputedStyles(ctx.canvas, styles);

				ctx.font = `${computedStyles.fontSize} ${computedStyles.fontFamily}`;

				const textAlign = textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'end' : 'start';

				ctx.textAlign = textAlign;

				if (rest.segments) {
					let xOffset = baseX;

					for (const segment of rest.segments) {
						const segStyles = getTextStyles(styleOverrides, undefined, undefined, undefined, undefined, undefined, segment.class);
						const text = String(segment.value);
						const segComputedStyles = getComputedStyles(ctx.canvas, segStyles);
						const fontWeight = segComputedStyles.fontWeight || '';
						const fontSize = segComputedStyles.fontSize || '10px';
						const fontFamily = segComputedStyles.fontFamily || 'sans-serif';

						ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`.trim();
						renderText(ctx, text, { x: xOffset, y: baseY }, segStyles);
						xOffset += ctx.measureText(text).width;
					}
				} else {
					for (let index = 0; index < c.wordsByLines.length; index++) {
						const line = c.wordsByLines[index];
						const text = line.words.join(' ');
						const xPos = baseX;
						const yPos = baseY + index * effectiveLineHeight;

						renderText(ctx, text, { x: xPos, y: yPos }, styles);
					}
				}

				ctx.restore();
			}
		}

		// TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
		const fillKey = createKey(() => rest.fill);

		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Text',
			kind: 'mark',
			markInfo: () => textMarkInfo(rest, c.dataMode),
			canvasRender: {
				render,
				deps: () => [
					c.dataMode,
					c.dataMode ? c.resolvedItems : null,
					rest.value,
					rest.segments,
					c.motionX,
					c.motionY,
					fillKey.current,
					strokeKey.current,
					rest.strokeWidth,
					rest.opacity,
					rest.class,
					c.truncateConfig,
					rest.rotate,
					rest.fontSize,
					rest.lineHeight,
					rest.textAnchor,
					rest.verticalAnchor
				]
			}
		});
	});
}