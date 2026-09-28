import * as $ from 'svelte/internal/server';
import BadgeAsLink from "./badge-as-link.svelte";
import BadgeCustomColors from "./badge-custom-colors.svelte";
import BadgeLongText from "./badge-long-text.svelte";
import BadgeVariants from "./badge-variants.svelte";
import BadgeWithIconLeft from "./badge-with-icon-left.svelte";
import BadgeWithIconRight from "./badge-with-icon-right.svelte";
import BadgeWithSpinner from "./badge-with-spinner.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Badge($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'lg:grid-cols-1',
		children: ($$renderer) => {
			BadgeVariants($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeWithIconLeft($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeWithIconRight($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeWithSpinner($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeAsLink($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeLongText($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeCustomColors($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}