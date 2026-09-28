import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_commands($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-xl flex-col gap-4">`);
	PMCommand($$renderer, { command: 'execute', args: ['shadcn-svelte@next', 'add'] });
	$$renderer.push(`<!----> `);
	PMCommand($$renderer, { command: 'add', args: ['bits-ui', '-D'] });
	$$renderer.push(`<!----></div>`);
}