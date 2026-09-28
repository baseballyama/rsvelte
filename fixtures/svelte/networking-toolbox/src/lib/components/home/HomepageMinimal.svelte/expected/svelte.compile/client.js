import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import SearchFilter from '$lib/components/furniture/SearchFilter.svelte';
import { useToolSearch } from '$lib/composables/useToolSearch.svelte';

var root = $.from_html(`<section class="hero-minimal svelte-10330cd"><h1 class="svelte-10330cd"> </h1></section> <!> <!>`, 1);

export default function HomepageMinimal($$anchor, $$props) {
	$.push($$props, true);

	const search = useToolSearch(() => [...$$props.toolPages, ...$$props.referencePages]);
	var fragment = root();
	var section = $.first_child(fragment);
	var h1 = $.child(section);
	var text = $.only_child(h1, true);

	$.reset(section);

	var node = $.sibling(section, 2);

	SearchFilter(node, {
		get filteredTools() {
			return search.filtered;
		},

		set filteredTools($$value) {
			search.filtered = $$value;
		},

		get searchQuery() {
			return search.query;
		},

		set searchQuery($$value) {
			search.query = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	ToolsGrid(node_1, {
		idPrefix: 'minimal',
		get tools() {
			return search.filtered;
		},

		get searchQuery() {
			return search.query;
		}
	});

	$.template_effect(() => $.set_text(text, site.title));
	$.append($$anchor, fragment);
	$.pop();
}