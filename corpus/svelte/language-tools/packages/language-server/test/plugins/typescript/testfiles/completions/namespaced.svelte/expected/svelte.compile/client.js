import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Components from './ComponentDef';
import { ComponentDef3, ComponentDef6 } from './ComponentDef';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Namespaced($$anchor) {
	const Components2 = { ComponentDef3, ComponentDef6 };
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => Components.ComponentDef3, ($$anchor, Components_ComponentDef3) => {
		Components_ComponentDef3($$anchor, { hi: '' });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Components2.ComponentDef3, ($$anchor, Components2_ComponentDef3) => {
		Components2_ComponentDef3($$anchor, { hi: '' });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Components2.ComponentDef6, ($$anchor, Components2_ComponentDef6) => {
		Components2_ComponentDef6($$anchor, { hi: '' });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => Components.Namespace2.ComponentDef4, ($$anchor, Components_Namespace2_ComponentDef4) => {
		Components_Namespace2_ComponentDef4($$anchor, { hi: '' });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Components.Namespace2.ComponentDef7, ($$anchor, Components_Namespace2_ComponentDef7) => {
		Components_Namespace2_ComponentDef7($$anchor, { hi4: '', hi: '' });
	});

	$.append($$anchor, fragment);
}