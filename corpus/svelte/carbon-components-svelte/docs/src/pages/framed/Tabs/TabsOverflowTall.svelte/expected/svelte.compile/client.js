import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsOverflowTall($$anchor) {
	const items = Array.from({ length: 12 }, (_, i) => ({ label: `Tab label ${i + 1}`, secondaryLabel: `(${i + 1}/12)` }));

	Tabs($$anchor, {
		type: 'container',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, $.index, ($$anchor, item) => {
				Tab($$anchor, {
					get label() {
						return $.get(item).label;
					},

					get secondaryLabel() {
						return $.get(item).secondaryLabel;
					}
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_1 = $.first_child(fragment_3);

				$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
					TabContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(item).label ?? ''} content`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			}
		}
	});
}