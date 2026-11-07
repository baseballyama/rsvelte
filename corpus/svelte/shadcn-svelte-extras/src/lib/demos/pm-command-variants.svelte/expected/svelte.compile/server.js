import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_variants($$renderer) {
	PMCommand($$renderer, {
		variant: 'secondary',
		command: 'execute',
		args: ['jsrepo', 'add', 'ui/pm-command'],
		class: 'max-w-xl'
	});
}