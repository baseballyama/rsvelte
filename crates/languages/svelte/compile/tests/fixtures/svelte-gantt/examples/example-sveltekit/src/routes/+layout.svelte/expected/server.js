import * as $ from 'svelte/internal/server';
import './../gantt-default.css';
import { showOptions, setView, moveView } from './../stores/store';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<header class="header svelte-poj9ve"><div class="header-title svelte-poj9ve"><a href="https://github.com/ANovokmet/svelte-gantt" class="svelte-poj9ve">Svelte-gantt</a></div> <div class="header-controls svelte-poj9ve"><a href="/"><button type="button" class="svelte-poj9ve">LargeDataset</button></a> <a href="/dependencies"><button type="button" class="svelte-poj9ve">Dependencies</button></a> <a href="/tree"><button type="button" class="svelte-poj9ve">Tree</button></a> <a href="/external"><button type="button" class="svelte-poj9ve">External</button></a> <a href="/events"><button type="button" class="svelte-poj9ve">Events</button></a> <input type="button" value="&lt;" class="svelte-poj9ve"/> <button type="button" value="Day view" class="svelte-poj9ve">Day view</button> <input type="button" value=">" class="svelte-poj9ve"/> <button type="button" value="Week view" class="svelte-poj9ve">Week view</button> <button class="svelte-poj9ve">|||</button></div></header> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}