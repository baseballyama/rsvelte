import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_variants($$anchor) {
	PMCommand($$anchor, {
		variant: 'secondary',
		command: 'execute',
		args: ['jsrepo', 'add', 'ui/pm-command'],
		class: 'max-w-xl'
	});
}