import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search } from "carbon-components-svelte";

export default function SearchInputSkeleton($$anchor) {
	Search($$anchor, {
		skeleton: true,
		labelText: 'Search',
		placeholder: 'Search...'
	});
}