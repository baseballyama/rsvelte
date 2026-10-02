import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { getComputedStyles, renderText } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { degreesToRadians } from '$lib/utils/math.js';
import { TextState, textMarkInfo, getPixelValue } from './Text.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Text_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
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
					fill: itemFill ?? $$props.fill,
					fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
					stroke: itemStroke ?? $$props.stroke,
					strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
					opacity: itemOpacity ?? c.staticOpacity,
					paintOrder: 'stroke',
					...$$props.fontSize != null
						? {
							fontSize: typeof $$props.fontSize === 'number' ? `${$$props.fontSize}px` : $$props.fontSize
						}
						: {},
					...($$props.textAnchor ?? 'start') !== 'start' ? { textAnchor: $$props.textAnchor } : {}
				},
				classes: cls('lc-text', itemClass ?? c.staticClassName),
				style: $$props.style
			};
	}

	function render(ctx, styleOverrides) {
		const textAnchor = $$props.textAnchor ?? 'start';
		const verticalAnchor = $$props.verticalAnchor ?? 'end';
		const lineHeight = $$props.lineHeight ?? '1em';
		const dx = $$props.dx ?? 0;
		const dy = $$props.dy ?? 0;
		const rotate = $$props.rotate;
		const x = $$props.x;
		const y = $$props.y;

		if (c.dataMode) {
			const baseStyles = getTextStyles(styleOverrides);
			const computedStyles = getComputedStyles(ctx.canvas, baseStyles);

			ctx.font = `${computedStyles.fontSize} ${computedStyles.fontFamily}`;

			const textAlign = textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'end' : 'start';

			ctx.textAlign = textAlign;

			for (const item of c.resolvedItems) {
				const text = c.resolveTextValue(item.d);
				const resolvedFill = resolveColorProp($$props.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp($$props.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp($$props.fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp($$props.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp($$props.opacity, item.d);
				const resolvedClass = resolveStyleProp($$props.class, item.d);
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

			if ($$props.segments) {
				let xOffset = baseX;

				for (const segment of $$props.segments) {
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
	const fillKey = createKey(() => $$props.fill);

	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Text',
		kind: 'mark',
		markInfo: () => textMarkInfo(rest, c.dataMode),
		canvasRender: {
			render,
			deps: () => [
				c.dataMode,
				c.dataMode ? c.resolvedItems : null,
				$$props.value,
				$$props.segments,
				c.motionX,
				c.motionY,
				fillKey.current,
				strokeKey.current,
				$$props.strokeWidth,
				$$props.opacity,
				$$props.class,
				c.truncateConfig,
				$$props.rotate,
				$$props.fontSize,
				$$props.lineHeight,
				$$props.textAnchor,
				$$props.verticalAnchor
			]
		}
	});

	$.pop();
}