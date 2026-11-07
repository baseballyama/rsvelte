import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command($$renderer) {
	PMCommand($$renderer, { command: 'execute', args: ['jsrepo', 'add', 'ui/pm-command'] });
}