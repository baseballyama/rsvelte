import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tag from "carbon-components-svelte/Tag/Tag.svelte";
import TagSet from "carbon-components-svelte/TagSet/TagSet.svelte";

var root = $.from_html(` <a href="/all-tags">View all</a>`, 1);

export default function TagSet_customTooltip_test($$anchor) {
	const labels = ["Tag 1", "Tag 2", "Tag 3", "Tag 4"];

	TagSet($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => labels, $.index, ($$anchor, label) => {
				Tag($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(label)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			overflowTooltip: ($$anchor, $$slotProps) => {
				const count = $.derived(() => $$slotProps.count);
				var fragment_4 = root();
				var text_1 = $.first_child(fragment_4);

				$.next();

				$.template_effect(() => $.set_text(text_1, `${$.get(count) ?? ''}
    hidden `));

				$.append($$anchor, fragment_4);
			}
		}
	});
}