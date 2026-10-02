import * as $ from 'svelte/internal/server';
import ProductDetails from './components/product-details.svelte';
import { ProductStateProvider } from '$lib/core/composables/index.js';

export default function _page($$renderer, $$props) {
	let { data } = $$props;

	ProductStateProvider($$renderer, {
		children: ($$renderer) => {
			ProductDetails($$renderer, {});
		},
		$$slots: { default: true }
	});
}