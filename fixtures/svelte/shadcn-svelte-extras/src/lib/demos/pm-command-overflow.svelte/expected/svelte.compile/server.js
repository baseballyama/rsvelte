import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_overflow($$renderer) {
	PMCommand($$renderer, {
		command: 'execute',
		args: [
			'jsrepo',
			'build',
			'--preview',
			'--include-blocks',
			'pm-command',
			'button',
			'copy-button',
			'use-clipboard',
			'utils'
		],
		class: 'max-w-xl'
	});
}