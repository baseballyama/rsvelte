import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { globalProjects } from '../consts.js';
import { getProject } from '../theatre.js';
import { setContext } from 'svelte';

export default function Project($$anchor, $$props) {
	$.push($$props, true);

	let name = $.prop($$props, 'name', 3, 'default'),
		project = $.prop($$props, 'project', 15),
		isReady = $.prop($$props, 'isReady', 15);

	project(globalProjects.get(name()) ?? getProject(name(), $$props.config));
	globalProjects.set(name(), project());

	const syncReady = async () => {
		await project().ready;
		isReady(true);
	};

	syncReady();

	// CHILD CONTEXT
	setContext(`theatre-project`, project());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => project().ready, null, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ project: project() }));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}