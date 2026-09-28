import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InnerView from './InnerView.svelte';

export default function View($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			InnerView($$anchor, {
				get dom() {
					return $$props.dom;
				},

				get scene() {
					return $$props.scene;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($$props.dom) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}