import * as $ from 'svelte/internal/server';
import SkeletonAvatar from "./skeleton-avatar.svelte";
import SkeletonCard from "./skeleton-card.svelte";
import SkeletonForm from "./skeleton-form.svelte";
import SkeletonTable from "./skeleton-table.svelte";
import SkeletonText from "./skeleton-text.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Skeleton($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SkeletonAvatar($$renderer, {});
			$$renderer.push(`<!----> `);
			SkeletonCard($$renderer, {});
			$$renderer.push(`<!----> `);
			SkeletonText($$renderer, {});
			$$renderer.push(`<!----> `);
			SkeletonForm($$renderer, {});
			$$renderer.push(`<!----> `);
			SkeletonTable($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}