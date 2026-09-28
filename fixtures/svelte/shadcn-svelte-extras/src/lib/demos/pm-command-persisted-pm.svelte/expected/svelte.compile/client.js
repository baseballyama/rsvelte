import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';
import { PersistedState } from 'runed';

export default function Pm_command_persisted_pm($$anchor, $$props) {
	$.push($$props, true);

	const agent = new PersistedState('user-package-manager', 'npm');

	PMCommand($$anchor, {
		command: 'execute',
		args: ['jsrepo', 'add', 'ui/pm-command'],
		class: 'max-w-xl',
		get agent() {
			return agent.current;
		},

		set agent($$value) {
			agent.current = $$value;
		}
	});

	$.pop();
}