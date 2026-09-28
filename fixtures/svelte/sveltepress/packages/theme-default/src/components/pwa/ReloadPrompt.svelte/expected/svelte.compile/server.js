import * as $ from 'svelte/internal/server';
import { useRegisterSW } from 'virtual:pwa-register/svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Refresh from '../icons/Refresh.svelte';
import Btn from './Btn.svelte';
import Prompt from './Prompt.svelte';

export default function ReloadPrompt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const DEFAULT_WORK_OFFLINE = 'App ready to work offline';
		const DEFAULT_NEW_CONTENT_AVAILABLE = 'New content available, click on reload button to update';
		const DEFAULT_RELOAD = 'Reload';
		const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({ onRegistered() {}, onRegisterError() {} });

		function close() {
			offlineReady.set(false);
			needRefresh.set(false);
		}

		const appReadyToWorkOffline = themeOptions?.i18n?.pwa?.appReadyToWorkOffline || DEFAULT_WORK_OFFLINE;
		const newContentAvailable = themeOptions?.i18n?.pwa?.newContentAvailable || DEFAULT_NEW_CONTENT_AVAILABLE;
		const toast = $.derived(() => $.store_get($$store_subs ??= {}, '$offlineReady', offlineReady) || $.store_get($$store_subs ??= {}, '$needRefresh', needRefresh));
		const message = $.derived(() => $.store_get($$store_subs ??= {}, '$offlineReady', offlineReady) ? appReadyToWorkOffline : newContentAvailable);

		if (toast()) {
			$$renderer.push('<!--[0-->');

			Prompt($$renderer, {
				message: message(),
				children: ($$renderer) => {
					if ($.store_get($$store_subs ??= {}, '$needRefresh', needRefresh)) {
						$$renderer.push('<!--[0-->');

						Btn($$renderer, {
							onclick: () => updateServiceWorker(true),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(themeOptions?.i18n?.pwa?.reload || DEFAULT_RELOAD)} `);
								Refresh($$renderer, {});
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}