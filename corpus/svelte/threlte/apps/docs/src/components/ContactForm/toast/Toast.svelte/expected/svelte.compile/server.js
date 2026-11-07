import * as $ from 'svelte/internal/server';
import { Close, Checkmark, Warning, Error } from './icons';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type = 'info', open = true, title = '', message } = $$props;
		let error = $.derived(() => type == 'error');
		let warning = $.derived(() => type == 'warning');
		let info = $.derived(() => type == 'info');
		const icon = { error: Error, warning: Warning, info: Checkmark };
		const dispatch = createEventDispatcher();

		function close() {
			open = false;
			dispatch('toast-closed');
		}

		if (open) {
			$$renderer.push('<!--[0-->');

			const SvelteComponent = icon[type];

			$$renderer.push(`<section${$.attr_class('svelte-9ofd8p', void 0, { 'error': error(), 'warning': warning(), 'info': info() })}><span class="svelte-9ofd8p">`);

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');
				SvelteComponent($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <b>${$.escape(title ? title + ':' : '')}</b>${$.escape(message)}</span> <span role="button" tabindex="0" class="svelte-9ofd8p">`);
			Close($$renderer, {});
			$$renderer.push(`<!----></span></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { open });
	});
}