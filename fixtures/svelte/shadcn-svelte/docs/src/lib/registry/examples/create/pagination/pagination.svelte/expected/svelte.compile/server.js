import * as $ from 'svelte/internal/server';
import PaginationBasic from "./pagination-basic.svelte";
import PaginationSimple from "./pagination-simple.svelte";
import PaginationWithSelect from "./pagination-with-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Pagination($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			PaginationBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			PaginationSimple($$renderer, {});
			$$renderer.push(`<!----> `);
			PaginationWithSelect($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}