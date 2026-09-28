import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Code } from '@layerstack/docs/components';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>Loading component...</p>`);
var root_2 = $.from_html(`<p>Loading source...</p>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function PromiseExample($$anchor, $$props) {
	const componentPromise = import(`../../examples/${$$props.component}/${$$props.name}.svelte`);
	const sourcePromise = import(`../../examples/${$$props.component}/${$$props.name}.svelte?raw`);
	var fragment = root_3();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => componentPromise,
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		($$anchor, module) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $.get(module).default, ($$anchor, module_default) => {
				module_default($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		($$anchor, error) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Error loading component: ${$.get(error).message ?? ''}`));
			$.append($$anchor, p);
		}
	);

	var node_2 = $.sibling(node, 2);

	$.await(
		node_2,
		() => sourcePromise,
		($$anchor) => {
			var p_3 = root_2();

			$.append($$anchor, p_3);
		},
		($$anchor, source) => {
			Code($$anchor, {
				get source() {
					return $.get(source).default;
				}
			});
		},
		($$anchor, error) => {
			var p_2 = root();
			var text_1 = $.only_child(p_2);

			$.template_effect(() => $.set_text(text_1, `Error loading source: ${$.get(error).message ?? ''}`));
			$.append($$anchor, p_2);
		}
	);

	$.append($$anchor, fragment);
}