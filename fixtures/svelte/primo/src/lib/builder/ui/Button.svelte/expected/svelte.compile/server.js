import * as $ from 'svelte/internal/server';
import UI from '$lib/builder/ui';
import Icon from '@iconify/svelte';

export default function Button($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [label]?
	 * @property {() => void} [onclick]?
	 * @property {string} [icon]?
	 * @property {'button' | 'submit'} [type]?
	 * @property {string} [variants]?
	 * @property {boolean} [disabled]?
	 * @property {boolean} [loading]?
	 * @property {boolean} [arrow]?
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let {
		label,
		onclick,
		icon,
		variants = '',
		type = /** @type {"button" | "submit"} */ ('button'),
		children,
		disabled = false,
		loading = false,
		arrow = false
	} = $$props;

	$$renderer.push(`<button${$.attr_class(`Button ${$.stringify(variants)}`, 'svelte-d37d3q')}${$.attr('type', type)}${$.attr('disabled', disabled || loading, true)}>`);

	if (loading) {
		$$renderer.push('<!--[0-->');

		if (UI.Spinner) {
			$$renderer.push('<!--[-->');
			UI.Spinner($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (icon) {
		$$renderer.push(`<!--[0--><span${$.attr_class('', void 0, { 'hidden': loading })}>`);
		Icon($$renderer, { icon });
		$$renderer.push(`<!----></span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else if (label) {
		$$renderer.push(`<!--[1--><span${$.attr_class('', void 0, { 'hidden': loading })}>${$.escape(label)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (arrow) {
		$$renderer.push('<!--[0-->');
		Icon($$renderer, { icon: 'ooui:arrow-next-ltr' });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></button>`);
}