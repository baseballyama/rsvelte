import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { isDevPlayground } from './appSettings';
import Switch from '../ui/Switch.svelte';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const settings = getContext('settings');
		const windowLocation = window.location;
		let showSettings = false;
		const parentWindow = window.parent;
		const search = windowLocation.search;
		const isSplitScreen = parentWindow && parentWindow.location.pathname === '/split/';

		$$renderer.push(`<button id="options-button"${$.attr_class(`editor-dev-button ${showSettings ? 'active' : ''}`, 'svelte-ob2upx')} aria-label="Toggle settings"></button> `);

		if (showSettings) {
			$$renderer.push(`<!--[0--><div class="switches svelte-ob2upx">`);

			if ($.store_get($$store_subs ??= {}, '$settings', settings).isRichText && isDevPlayground) {
				$$renderer.push('<!--[0-->');

				Switch($$renderer, {
					onclick: () => {
						settings.setOption('isCollab', !$.store_get($$store_subs ??= {}, '$settings', settings).isCollab);
						window.location.reload();
					},
					checked: $.store_get($$store_subs ??= {}, '$settings', settings).isCollab,
					text: 'Collaboration'
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (isDevPlayground) {
				$$renderer.push('<!--[0-->');

				Switch($$renderer, {
					onclick: () => {
						if (isSplitScreen) {
							window.parent.location.href = `/${search}`;
						} else {
							window.location.href = `/split/${search}`;
						}
					},
					checked: isSplitScreen,
					text: 'Split Screen'
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Switch($$renderer, {
				onclick: () => settings.setOption('showTreeView', !$.store_get($$store_subs ??= {}, '$settings', settings).showTreeView),
				checked: $.store_get($$store_subs ??= {}, '$settings', settings).showTreeView,
				text: 'Debug View'
			});

			$$renderer.push(`<!----> `);

			Switch($$renderer, {
				onclick: () => {
					settings.setOption('isRichText', !$.store_get($$store_subs ??= {}, '$settings', settings).isRichText);
					settings.setOption('isCollab', false);
				},
				checked: $.store_get($$store_subs ??= {}, '$settings', settings).isRichText,
				text: 'Rich Text'
			});

			$$renderer.push(`<!----> `);

			Switch($$renderer, {
				onclick: () => {
					settings.setOption('isCodeHighlighted', !$.store_get($$store_subs ??= {}, '$settings', settings).isCodeHighlighted);
				},
				checked: $.store_get($$store_subs ??= {}, '$settings', settings).isCodeHighlighted,
				text: 'Enable Code Highlighting'
			});

			$$renderer.push(`<!----> `);

			Switch($$renderer, {
				onclick: () => {
					settings.setOption('isCodeShiki', !$.store_get($$store_subs ??= {}, '$settings', settings).isCodeShiki);
				},
				checked: $.store_get($$store_subs ??= {}, '$settings', settings).isCodeShiki,
				text: 'Use Shiki for Code Highlighting'
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}