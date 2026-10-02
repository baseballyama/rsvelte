import * as $ from 'svelte/internal/server';
import { formatDate } from './util';

export default function Call_hierarchy_import($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		formatDate(new Date());

		function foo() {
			formatDate(new Date());
		}

		foo();
		$$renderer.push(`<!---->${$.escape(formatDate(new Date()))}`);
	});
}