import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Studio($$anchor, $$props) {
	let enabled = $.prop($$props, 'enabled', 3, true),
		hide = $.prop($$props, 'hide', 3, false);

	const browser = typeof window !== 'undefined';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(node_1, () => import('./InnerStudio.svelte'), null, ($$anchor, Component) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => $.get(Component).default, ($$anchor, Component_default) => {
					Component_default($$anchor, {
						get hide() {
							return hide();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if (browser && enabled()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}