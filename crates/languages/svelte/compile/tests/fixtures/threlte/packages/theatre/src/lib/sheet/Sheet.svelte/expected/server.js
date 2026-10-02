import * as $ from 'svelte/internal/server';
import { getContext, setContext } from 'svelte';
import { SequenceController } from '../sequence/SequenceController.js';
import { globalSheets } from '../consts.js';

export default function Sheet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// parent context
		const project = getContext('theatre-project');

		const projectName = project.address.projectId;

		// props
		let {
			name = 'default',
			sheet = void 0,
			instance = undefined,
			children
		} = $$props;

		// bindings
		sheet = globalSheets.get(`${projectName}-${name}-${instance}`) ?? project.sheet(name, instance);

		// register instance logic
		globalSheets.set(`${projectName}-${name}-${instance}`, sheet);

		// init sequence store
		const sequence = new SequenceController(sheet.sequence);

		// child context
		const sequences = { default: sequence };

		setContext('theatre-sheet', { sheet, sequences });
		children?.($$renderer, { sheet });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { sheet, project, sequence });
	});
}