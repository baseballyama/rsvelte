import * as $ from 'svelte/internal/server';
import { format as formatUtil } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { asAny } from '$lib/utils/types.js';

export default function TooltipHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			colorRef: colorRefProp = void 0,
			value,
			format,
			color,
			classes = { root: '', color: '' },
			props = { root: {}, color: {} },
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let colorRef = void 0;

		$$renderer.push(`<div${$.attributes(
			{
				class: $.clsx(cls('lc-tooltip-header', classes.root, props.root?.class, className)),
				...restProps
			},
			'svelte-18kx2t4'
		)}>`);

		if (color) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cls('lc-tooltip-header-color', classes.color)), 'svelte-18kx2t4')}${$.attr_style('', { '--color': color })}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(format ? formatUtil(value, asAny(format)) : value)}`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref: refProp, colorRef: colorRefProp });
	});
}