import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

var root = $.from_html(`<div style="inline-size: 320px;" data-testid="tabs-overflow"><!></div>`);

export default function TabsOverflowFixture($$anchor) {
	const items = Array.from({ length: 10 }, (_, i) => `Tab label ${i + 1}`);
	var div = root();
	var node = $.child(div);

	Tabs(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
				Tab($$anchor, {
					get label() {
						return $.get(item);
					}
				});
			});

			$.append($$anchor, fragment);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.each(node_2, 17, () => items, $.index, ($$anchor, item) => {
					TabContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(item) ?? ''} content`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}