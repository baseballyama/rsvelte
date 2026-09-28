import * as $ from 'svelte/internal/server';
import IconGitBranch from "@lucide/svelte/icons/git-branch";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_with_icon($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		children: ($$renderer) => {
			IconGitBranch($$renderer, {});
			$$renderer.push(`<!----> New Branch`);
		},
		$$slots: { default: true }
	});
}