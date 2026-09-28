import * as $ from 'svelte/internal/server';
import { ArcLabelState } from './ArcLabel.shared.svelte.js';

export default function ArcLabel_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			Text,
			getArcTextProps,
			centroid,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			placement = 'centroid',
			startOffset,
			outerPadding,
			calloutLineLength = 16,
			calloutLabelOffset = 12,
			calloutPadding = 4,
			line,
			offset = 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new ArcLabelState(() => ({
			getArcTextProps,
			centroid,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			placement,
			startOffset,
			outerPadding,
			calloutLineLength,
			calloutLabelOffset,
			calloutPadding,
			line,
			offset
		}));

		if (placement === 'callout' && c.calloutGeometry) {
			$$renderer.push('<!--[0-->');

			if (Path) {
				$$renderer.push('<!--[-->');
				Path($$renderer, $.spread_props([{ pathData: c.calloutGeometry.pathData }, line]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (Text) {
			$$renderer.push('<!--[-->');
			Text($$renderer, $.spread_props([c.arcTextProps, restProps]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}