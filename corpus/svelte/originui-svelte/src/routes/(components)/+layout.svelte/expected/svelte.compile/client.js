import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Cta from '$lib/demo/cta.svelte';
import * as ComponentDialog from '$lib/demo/component-preview';
import { mode } from 'mode-watcher';
import { Toaster } from 'svelte-sonner';

var root = $.from_html(`<main class="grow"><!> <!></main> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	const $mode = () => $.store_get(mode, '$mode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_1();
	var node = $.first_child(fragment);

	Toaster(node, {
		position: 'top-right',
		get theme() {
			return $mode();
		}
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => ComponentDialog.DialogContextProvider, ($$anchor, ComponentDialog_DialogContextProvider) => {
		ComponentDialog_DialogContextProvider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var main = $.first_child(fragment_1);
				var node_2 = $.child(main);

				$.snippet(node_2, () => $$props.children);

				var node_3 = $.sibling(node_2, 2);

				Cta(node_3, {});
				$.reset(main);

				var node_4 = $.sibling(main, 2);

				$.component(node_4, () => ComponentDialog.Dialog, ($$anchor, ComponentDialog_Dialog) => {
					ComponentDialog_Dialog($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$$cleanup();
}