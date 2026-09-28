import * as $ from 'svelte/internal/server';
import { scrollTo } from './GlobalOptionsList.svelte';

export default function ScrollToButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id } = $$props;

		$$renderer.push(`<sup><button${$.attr('title', `See how to set the ${$.stringify(id)} option`)} class="svelte-19uzolc">?</button></sup>`);
	});
}