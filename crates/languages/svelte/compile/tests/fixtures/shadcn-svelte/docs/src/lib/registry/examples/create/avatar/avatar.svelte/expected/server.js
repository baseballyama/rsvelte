import * as $ from 'svelte/internal/server';
import AvatarGroupExample from "./avatar-group-example.svelte";
import AvatarGroupWithCount from "./avatar-group-with-count.svelte";
import AvatarGroupWithIconCount from "./avatar-group-with-icon-count.svelte";
import AvatarInEmpty from "./avatar-in-empty.svelte";
import AvatarSizes from "./avatar-sizes.svelte";
import AvatarWithBadgeIcon from "./avatar-with-badge-icon.svelte";
import AvatarWithBadge from "./avatar-with-badge.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Avatar($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			AvatarSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarWithBadge($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarWithBadgeIcon($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarGroupExample($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarGroupWithCount($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarGroupWithIconCount($$renderer, {});
			$$renderer.push(`<!----> `);
			AvatarInEmpty($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}