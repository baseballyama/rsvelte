import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';

export default function Pattern_html($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('pattern-', uid)),
		size = $.prop($$props, 'size', 3, 4),
		width = $.prop($$props, 'width', 19, size),
		height = $.prop($$props, 'height', 19, size);

	function withOpacity(color, opacity) {
		return opacity === 1
			? color
			: `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
	}

	function createCSSPattern() {
		const layers = [];

		if ($$props.lines) {
			const lineDefs = Array.isArray($$props.lines)
				? $$props.lines
				: $$props.lines === true ? [{}] : [$$props.lines];

			for (const line of lineDefs) {
				const color = withOpacity(line.color ?? 'var(--color-surface-content, currentColor)', line.opacity ?? 1);
				const sw = line.width ?? 1;
				let rotate = Math.round(line.rotate ?? 0) % 360;

				if (rotate > 180) rotate = rotate - 360; else if (rotate > 90) rotate = rotate - 180; else if (rotate < -180) rotate = rotate + 360; else if (rotate < -90) rotate = rotate + 180;

				let angle;
				let period;

				if (rotate === 0) {
					angle = 0;
					period = height();
				} else if (rotate === 90) {
					angle = 90;
					period = width();
				} else if (rotate > 0) {
					angle = 45;
					period = width() * height() / Math.sqrt(width() * width() + height() * height());
				} else {
					angle = 135;
					period = width() * height() / Math.sqrt(width() * width() + height() * height());
				}

				layers.push(`repeating-linear-gradient(${angle}deg, ${color} 0 ${sw}px, transparent ${sw}px ${period}px)`);
			}
		}

		if ($$props.circles) {
			const circleDefs = Array.isArray($$props.circles)
				? $$props.circles
				: $$props.circles === true ? [{}] : [$$props.circles];

			for (const circle of circleDefs) {
				const color = withOpacity(circle.color ?? 'var(--color-surface-content, currentColor)', circle.opacity ?? 1);
				const r = circle.radius ?? 1;

				if (circle.stagger) {
					layers.push(`radial-gradient(circle at 25% 25%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size()}px ${size()}px`, `radial-gradient(circle at 75% 75%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size()}px ${size()}px`);
				} else {
					layers.push(`radial-gradient(circle at center, ${color} ${r}px, transparent ${r}px) 0 0 / ${size()}px ${size()}px`);
				}
			}
		}

		const isImage = $$props.background != null && (/gradient\(|url\(/i).test($$props.background);

		if (isImage) layers.push(`${$$props.background} 0 0 / ${width()}px ${height()}px`);
		if (layers.length === 0) return $$props.background ?? 'transparent';

		return !isImage && $$props.background
			? `${layers.join(', ')}, ${$$props.background}`
			: layers.join(', ');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ id: id(), pattern: createCSSPattern() }));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}