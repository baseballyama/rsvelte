import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { initSearcher } from '../commands';
import { teamSearcher } from '../searchers';
import Template from './template.svelte';

export default function Teams($$anchor, $$props) {
	$.push($$props, true);

	const $results = () => $.store_get(results, '$results', $$stores);
	const $search = () => $.store_get(search, '$search', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { search, results } = initSearcher(teamSearcher);

	Template($$anchor, {
		get options() {
			return $results();
		},

		get search() {
			$.mark_store_binding();

			return $search();
		},

		set search($$value) {
			$.store_set(search, $$value);
		}
	});

	$.pop();
	$$cleanup();
}