import * as $ from 'svelte/internal/server';
import EmptyBasic from "./empty-basic.svelte";
import EmptyInCard from "./empty-in-card.svelte";
import EmptyWithBorder from "./empty-with-border.svelte";
import EmptyWithIcon from "./empty-with-icon.svelte";
import EmptyWithMutedBackgroundAlt from "./empty-with-muted-background-alt.svelte";
import EmptyWithMutedBackground from "./empty-with-muted-background.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Empty($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			EmptyBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyWithMutedBackground($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyWithBorder($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyWithIcon($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyWithMutedBackgroundAlt($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyInCard($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}