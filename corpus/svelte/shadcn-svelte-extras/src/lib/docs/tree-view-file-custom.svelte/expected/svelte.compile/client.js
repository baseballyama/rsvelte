import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeViewFile } from '$lib/components/ui/tree-view';
import * as Icons from '$lib/components/icons';

export default function Tree_view_file_custom($$anchor, $$props) {
	{
		const icon = ($$anchor, $$arg0) => {
			let name = () => ($$arg0?.()).name;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Icons.CSS, ($$anchor, Icons_CSS) => {
						Icons_CSS($$anchor, { class: 'size-3' });
					});

					$.append($$anchor, fragment_2);
				};

				var d = $.derived(() => name().endsWith('.css'));

				var consequent_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => Icons.Svelte, ($$anchor, Icons_Svelte) => {
						Icons_Svelte($$anchor, { class: 'size-4' });
					});

					$.append($$anchor, fragment_3);
				};

				var d_1 = $.derived(() => name().endsWith('.svelte'));

				var consequent_2 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_3 = $.first_child(fragment_4);

					$.component(node_3, () => Icons.TypeScript, ($$anchor, Icons_TypeScript) => {
						Icons_TypeScript($$anchor, { class: 'size-3' });
					});

					$.append($$anchor, fragment_4);
				};

				var d_2 = $.derived(() => name().endsWith('.ts'));

				$.if(node, ($$render) => {
					if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1); else if ($.get(d_2)) $$render(consequent_2, 2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		TreeViewFile($$anchor, {
			get name() {
				return $$props.name;
			},
			icon,
			$$slots: { icon: true }
		});
	}
}