import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';

export default function Pm_command_overflow($$anchor) {
	PMCommand($$anchor, {
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