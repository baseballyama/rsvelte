import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import themeOptions from 'virtual:sveltepress/theme-default';
import Close from '../icons/Close.svelte';
import Btn from './Btn.svelte';

export default function Prompt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { message, children } = $$props;
		const dispatcher = createEventDispatcher();

		function handleClose() {
			dispatcher('close');
		}

		const DEFAULT_TIP = 'Tip';
		const DEFAULT_CLOSE = 'Close';

		$$renderer.push(`<div class="pwa-toast svelte-c4cnpn" role="alert"><div class="pwa-title svelte-c4cnpn">${$.escape(themeOptions?.i18n?.pwa?.tip || DEFAULT_TIP)}</div> <div class="message svelte-c4cnpn"><span>${$.escape(message)}</span></div> <div class="actions svelte-c4cnpn">`);
		children?.($$renderer);
		$$renderer.push(`<!----> `);

		Btn($$renderer, {
			onclick: handleClose,
			flat: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(themeOptions?.i18n?.pwa?.close || DEFAULT_CLOSE)} `);
				Close($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}