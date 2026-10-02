import * as $ from 'svelte/internal/server';
import * as Components from './ComponentDef';
import { ComponentDef3, ComponentDef6 } from './ComponentDef';

export default function Namespaced($$renderer) {
	const Components2 = { ComponentDef3, ComponentDef6 };

	if (Components.ComponentDef3) {
		$$renderer.push('<!--[-->');
		Components.ComponentDef3($$renderer, { hi: '' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Components2.ComponentDef3) {
		$$renderer.push('<!--[-->');
		Components2.ComponentDef3($$renderer, { hi: '' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Components2.ComponentDef6) {
		$$renderer.push('<!--[-->');
		Components2.ComponentDef6($$renderer, { hi: '' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Components.Namespace2.ComponentDef4) {
		$$renderer.push('<!--[-->');
		Components.Namespace2.ComponentDef4($$renderer, { hi: '' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Components.Namespace2.ComponentDef7) {
		$$renderer.push('<!--[-->');
		Components.Namespace2.ComponentDef7($$renderer, { hi4: '', hi: '' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}