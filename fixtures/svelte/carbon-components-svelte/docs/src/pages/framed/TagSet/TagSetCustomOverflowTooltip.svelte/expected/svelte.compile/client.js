import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tag, TagSet } from "carbon-components-svelte";

var root = $.from_html(`<strong> </strong> `, 1);
var root_1 = $.from_html(`<div style="max-width: 12rem;"><!></div>`);

export default function TagSetCustomOverflowTooltip($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" },
		{ label: "Ember", type: "magenta" },
		{ label: "Preact", type: "cyan" }
	];

	var div = root_1();
	var node = $.child(div);

	TagSet(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => frameworks, $.index, ($$anchor, framework) => {
				Tag($$anchor, {
					get type() {
						return $.get(framework).type;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(framework).label));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},

		$$slots: {
			default: true,
			overflowTooltip: ($$anchor, $$slotProps) => {
				const tags = $.derived(() => $$slotProps.tags);
				const count = $.derived(() => $$slotProps.count);
				var fragment_3 = root();
				var strong = $.first_child(fragment_3);
				var text_1 = $.only_child(strong);
				var text_2 = $.sibling(strong);

				$.template_effect(
					($0) => {
						$.set_text(text_1, `${$.get(count) ?? ''} more:`);
						$.set_text(text_2, ` ${$0 ?? ''}`);
					},
					[() => $.get(tags).map((tag) => tag.label).join(", ")]
				);

				$.append($$anchor, fragment_3);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}