import * as $ from 'svelte/internal/server';
import { format as formatUtil } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { asAny } from '$lib/utils/types.js';

export default function TooltipItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			labelRef: labelRefProp = void 0,
			valueRef: valueRefProp = void 0,
			colorRef: colorRefProp = void 0,
			label,
			value,
			format,
			valueAlign = 'left',
			color,
			classes = { root: '', label: '', value: '', color: '' },
			props = { root: {}, label: {}, value: {}, color: {} },
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let labelRef = void 0;
		let valueRef = void 0;
		let colorRef = void 0;

		$$renderer.push(`<div${$.attributes(
			{
				...props.root,
				class: $.clsx(cls('lc-tooltip-item-root', classes.root, className, props.root?.class)),
				...restProps
			},
			'svelte-3cu8im'
		)}><div${$.attributes(
			{
				...props.label,
				class: $.clsx(cls('lc-tooltip-item-label', 'label', classes.label, props.label?.class))
			},
			'svelte-3cu8im'
		)}>`);

		if (color) {
			$$renderer.push(`<!--[0--><div${$.attributes(
				{
					...props.color,
					class: $.clsx(cls('lc-tooltip-item-color', 'color', classes.color, props.color?.class))
				},
				'svelte-3cu8im',
				void 0,
				{ '--color': color }
			)}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (typeof label === 'function') {
			$$renderer.push('<!--[0-->');
			label($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(label)}`);
		}

		$$renderer.push(`<!--]--></div> <div${$.attributes(
			{
				...props.value,
				class: $.clsx(cls('lc-tooltip-item-value', 'value', classes.value, props.value?.class)),
				'data-align': valueAlign
			},
			'svelte-3cu8im'
		)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(format ? formatUtil(value, asAny(format)) : value)}`);
		}

		$$renderer.push(`<!--]--></div></div>`);

		$.bind_props($$props, {
			ref: refProp,
			labelRef: labelRefProp,
			valueRef: valueRefProp,
			colorRef: colorRefProp
		});
	});
}