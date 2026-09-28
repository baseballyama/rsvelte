import * as $ from 'svelte/internal/server';
import TableBasic from "./table-basic.svelte";
import TableSimple from "./table-simple.svelte";
import TableWithActions from "./table-with-actions.svelte";
import TableWithBadges from "./table-with-badges.svelte";
import TableWithFooter from "./table-with-footer.svelte";
import TableWithInput from "./table-with-input.svelte";
import TableWithSelect from "./table-with-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Table($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			TableBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			TableWithFooter($$renderer, {});
			$$renderer.push(`<!----> `);
			TableSimple($$renderer, {});
			$$renderer.push(`<!----> `);
			TableWithBadges($$renderer, {});
			$$renderer.push(`<!----> `);
			TableWithActions($$renderer, {});
			$$renderer.push(`<!----> `);
			TableWithSelect($$renderer, {});
			$$renderer.push(`<!----> `);
			TableWithInput($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}