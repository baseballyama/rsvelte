import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from 'svelte';
import { SequenceController } from '../sequence/SequenceController.js';
import { globalSheets } from '../consts.js';

export default function Sheet($$anchor, $$props) {
	$.push($$props, true);

	// parent context
	const project = getContext('theatre-project');

	const projectName = project.address.projectId;

	// props
	let name = $.prop($$props, 'name', 3, 'default'),
		sheet = $.prop($$props, 'sheet', 15),
		instance = $.prop($$props, 'instance', 3, undefined);

	// bindings
	sheet(globalSheets.get(`${projectName}-${name()}-${instance()}`) ?? project.sheet(name(), instance()));

	// register instance logic
	globalSheets.set(`${projectName}-${name()}-${instance()}`, sheet());

	// init sequence store
	const sequence = new SequenceController(sheet().sequence);

	// child context
	const sequences = { default: sequence };

	setContext('theatre-sheet', { sheet: sheet(), sequences });

	var $$exports = { project, sequence };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ sheet: sheet() }));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}