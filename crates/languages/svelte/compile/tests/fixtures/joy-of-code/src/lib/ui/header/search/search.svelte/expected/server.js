import * as $ from 'svelte/internal/server';
import { createDialog, melt } from '@melt-ui/svelte';
import { fade } from 'svelte/transition';
import { onNavigate } from '$app/navigation';
import { browser } from '$app/environment';
import SearchIcon from './search-icon.svelte';
import SearchWorker from './search-worker?worker';

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const {
			elements: { trigger, portalled, overlay, content },
			states: { open }
		} = createDialog();

		const platform = browser && window.navigator.platform;
		let search = 'idle';
		let searchTerm = '';
		let results = [];
		let searchWorker = void 0;

		function initialize() {
			if (search === 'ready') return;

			search = 'load';
			searchWorker = new SearchWorker();

			searchWorker.addEventListener('message', (e) => {
				const { type, payload } = e.data;

				type === 'ready' && (search = 'ready');
				type === 'results' && (results = payload.results);
			});

			searchWorker.postMessage({ type: 'load' });
		}

		onNavigate(() => {
			$.store_set(open, false);
		});

		$$renderer.push(`<button class="open-search svelte-gmozwn">`);
		SearchIcon($$renderer, {});
		$$renderer.push(`<!----> <span class="svelte-gmozwn">Search</span> <div class="shortcut svelte-gmozwn"><kbd class="svelte-gmozwn">${$.escape(platform === 'MacIntel' ? '⌘' : 'Ctrl')}</kbd> + <kbd class="svelte-gmozwn">K</kbd></div></button> <div>`);

		if ($.store_get($$store_subs ??= {}, '$open', open)) {
			$$renderer.push(`<!--[0--><div class="overlay svelte-gmozwn"></div> <div class="content svelte-gmozwn"><input${$.attr('value', searchTerm)} placeholder="Search" autocomplete="off" spellcheck="false" type="search" class="svelte-gmozwn"/> `);

			if (results.length > 0) {
				$$renderer.push(`<!--[0--><div class="results svelte-gmozwn">`);

				if (search === 'load') {
					$$renderer.push(`<!--[0--><p>Loading...</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <ul><!--[-->`);

				const each_array = $.ensure_array_like(results);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let result = each_array[$$index_1];

					if (result.content.length > 0) {
						$$renderer.push(`<!--[0--><li class="svelte-gmozwn"><a${$.attr('href', `/${$.stringify(result.slug)}`)} class="svelte-gmozwn">${$.html(result.title)}</a> <ol class="svelte-gmozwn"><!--[-->`);

						const each_array_1 = $.ensure_array_like(result.content);

						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
							let content = each_array_1[$$index];

							$$renderer.push(`<li class="svelte-gmozwn">${$.html(content)}</li>`);
						}

						$$renderer.push(`<!--]--></ol></li>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}