import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProductDetails from './components/product-details.svelte';
import { ProductStateProvider } from '$lib/core/composables/index.js';

export default function _page($$anchor, $$props) {
	ProductStateProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			ProductDetails($$anchor, {});
		},
		$$slots: { default: true }
	});
}