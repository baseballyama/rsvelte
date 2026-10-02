import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';

var root = $.from_html(`<div class="flex w-full max-w-xl flex-col gap-4"><!> <!></div>`);

export default function Pm_command_commands($$anchor) {
	var div = root();
	var node = $.child(div);

	PMCommand(node, { command: 'execute', args: ['shadcn-svelte@next', 'add'] });

	var node_1 = $.sibling(node, 2);

	PMCommand(node_1, { command: 'add', args: ['bits-ui', '-D'] });
	$.reset(div);
	$.append($$anchor, div);
}