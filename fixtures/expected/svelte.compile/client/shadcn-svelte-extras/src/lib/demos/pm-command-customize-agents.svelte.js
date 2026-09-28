import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_customize_agents($$anchor) {
	PMCommand($$anchor, {
		command: 'execute',
		args: ['jsrepo', 'add', 'ui/pm-command'],
		agents: ['pnpm', 'npm', 'bun', 'yarn'],
		class: 'max-w-xl'
	});
}