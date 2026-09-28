import * as $ from 'svelte/internal/server';
import { Search } from "carbon-components-svelte";

export default function SearchInputSkeleton($$renderer) {
	Search($$renderer, {
		skeleton: true,
		labelText: 'Search',
		placeholder: 'Search...'
	});
}