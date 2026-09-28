import * as $ from 'svelte/internal/server';
import '../gantt-default.css';
import '../main.css';
import { showOptions, options } from './../stores/store';
import GanttViewNavigation from '../components/GanttViewNavigation.svelte';
import { base } from '$app/paths';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function onUpdateOptions(event) {
			const opts = event.detail;

			console.log('onUpdateOptions', opts);

			$.store_set(options, {
				...$.store_get($$store_subs ??= {}, '$options', options),
				...opts
			});
		}

		$$renderer.push(`<div class="app svelte-dngl6v"><header class="header svelte-dngl6v"><div class="header-title svelte-dngl6v"><a href="https://github.com/ANovokmet/svelte-gantt" class="svelte-dngl6v">Svelte-gantt</a></div> <div class="header-controls svelte-dngl6v"><div class="header-controls__row"><a${$.attr('href', `${$.stringify(base)}/large-dataset`)}><button type="button" class="svelte-dngl6v">LargeDataset</button></a> <a${$.attr('href', `${$.stringify(base)}/dependencies`)}><button type="button" class="svelte-dngl6v">Dependencies</button></a> <a${$.attr('href', `${$.stringify(base)}/tree`)}><button type="button" class="svelte-dngl6v">Tree</button></a> <a${$.attr('href', `${$.stringify(base)}/external`)}><button type="button" class="svelte-dngl6v">External</button></a> <a${$.attr('href', `${$.stringify(base)}/events`)}><button type="button" class="svelte-dngl6v">Events</button></a> <a${$.attr('href', `${$.stringify(base)}/multiple-charts`)}><button type="button" class="svelte-dngl6v">Multiple gantt</button></a> <a${$.attr('href', `${$.stringify(base)}/svelte-component`)}><button type="button" class="svelte-dngl6v">Usage as svelte component</button></a> <a${$.attr('href', `${$.stringify(base)}/column-styles`)}><button type="button" class="svelte-dngl6v">Column styles</button></a> <a${$.attr('href', `${$.stringify(base)}/pack-layout`)}><button type="button" class="svelte-dngl6v">Layouts</button></a> <a${$.attr('href', `${$.stringify(base)}/create-tasks`)}><button type="button" class="svelte-dngl6v">Create tasks</button></a></div> `);

		GanttViewNavigation($$renderer, {
			options: $.store_get($$store_subs ??= {}, '$options', options)
		});

		$$renderer.push(`<!----> <button class="svelte-dngl6v">|||</button></div></header> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}