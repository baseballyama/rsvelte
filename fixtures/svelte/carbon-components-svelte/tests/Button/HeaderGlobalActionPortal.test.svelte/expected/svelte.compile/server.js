import * as $ from 'svelte/internal/server';
import HeaderGlobalAction from "carbon-components-svelte/UIShell/HeaderGlobalAction.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function HeaderGlobalActionPortal_test($$renderer) {
	HeaderGlobalAction($$renderer, {
		'data-testid': 'header-global-action',
		icon: Add,
		iconDescription: 'Tooltip text',
		portalTooltip: true
	});
}