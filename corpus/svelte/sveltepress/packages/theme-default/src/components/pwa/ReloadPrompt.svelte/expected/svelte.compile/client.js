import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useRegisterSW } from 'virtual:pwa-register/svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Refresh from '../icons/Refresh.svelte';
import Btn from './Btn.svelte';
import Prompt from './Prompt.svelte';

var root = $.from_html(` <!>`, 1);

export default function ReloadPrompt($$anchor, $$props) {
	$.push($$props, true);

	const $offlineReady = () => $.store_get(offlineReady, '$offlineReady', $$stores);
	const $needRefresh = () => $.store_get(needRefresh, '$needRefresh', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	const toast = $.derived(() => $offlineReady() || $needRefresh());
	const message = $.derived(() => $offlineReady() ? appReadyToWorkOffline : newContentAvailable);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			Prompt($$anchor, {
				get message() {
					return $.get(message);
				},
				$$events: { close },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							Btn($$anchor, {
								onclick: () => updateServiceWorker(true),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root();
									var text = $.first_child(fragment_4);
									var node_2 = $.sibling(text);

									Refresh(node_2, {});
									$.template_effect(() => $.set_text(text, `${(themeOptions?.i18n?.pwa?.reload || DEFAULT_RELOAD) ?? ''} `));
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_1, ($$render) => {
							if ($needRefresh()) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(toast)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}