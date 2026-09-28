import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import UI from '../../ui';

export default function SaveButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {string} [variants]
		 * @property {string} [type]
		 * @property {boolean} [disabled]
		 * @property {boolean} [loading]
		 * @property {import('svelte').Snippet} [children]
		 */
		/** @type {Props} */
		let {
			variants = '',
			type = 'button',
			disabled = false,
			loading = false,
			children
		} = $$props;

		$$renderer.push(`<button${$.attr_class($.clsx(variants), 'svelte-o90jj1', { 'disabled': disabled || loading })}${$.attr('disabled', disabled || loading, true)}${$.attr('type', type)}>`);

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
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}