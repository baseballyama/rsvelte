import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
import { TeamsPanel, UsersPanel } from '$lib/commandCenter/panels';
import { readOnly } from '$lib/stores/billing';
import { canWriteTeams, canWriteUsers } from '$lib/stores/roles';
import { GRACE_PERIOD_OVERRIDE } from '$lib/system';
import { showCreateUser } from './+page.svelte';
import { showCreateTeam } from './teams/+page.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		const authProjectRoute = $.derived(() => {
			return resolveRoute('/(console)/project-[region]-[project]/auth', page.params);
		});

		$.head('trgyge', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Auth - Appwrite</title>`);
			});
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}