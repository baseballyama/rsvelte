import * as $ from 'svelte/internal/server';
import BreadcrumbBasic from "./breadcrumb-basic.svelte";
import BreadcrumbWithDropdown from "./breadcrumb-with-dropdown.svelte";
import BreadcrumbWithLink from "./breadcrumb-with-link.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Breadcrumb($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			BreadcrumbBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			BreadcrumbWithDropdown($$renderer, {});
			$$renderer.push(`<!----> `);
			BreadcrumbWithLink($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}