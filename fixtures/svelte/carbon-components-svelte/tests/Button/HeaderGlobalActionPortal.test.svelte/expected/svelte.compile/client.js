import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderGlobalAction from "carbon-components-svelte/UIShell/HeaderGlobalAction.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function HeaderGlobalActionPortal_test($$anchor) {
	HeaderGlobalAction($$anchor, {
		'data-testid': 'header-global-action',
		get icon() {
			return Add;
		},
		iconDescription: 'Tooltip text',
		portalTooltip: true
	});
}