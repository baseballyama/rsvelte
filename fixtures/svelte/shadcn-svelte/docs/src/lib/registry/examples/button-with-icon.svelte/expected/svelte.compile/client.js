import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconGitBranch from "@lucide/svelte/icons/git-branch";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> New Branch`, 1);

export default function Button_with_icon($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			IconGitBranch(node, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}