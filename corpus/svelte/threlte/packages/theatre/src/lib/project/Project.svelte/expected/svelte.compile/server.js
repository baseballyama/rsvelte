import * as $ from 'svelte/internal/server';
import { globalProjects } from '../consts.js';
import { getProject } from '../theatre.js';
import { setContext } from 'svelte';

export default function Project($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			name = 'default',
			config,
			project = void 0,
			isReady = void 0,
			children
		} = $$props;

		project = globalProjects.get(name) ?? getProject(name, config);
		globalProjects.set(name, project);

		const syncReady = async () => {
			await project.ready;
			isReady = true;
		};

		syncReady();

		// CHILD CONTEXT
		setContext(`theatre-project`, project);

		$.await($$renderer, project.ready, () => {}, () => {
			children?.($$renderer, { project });
			$$renderer.push(`<!---->`);
		});

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { project, isReady });
	});
}