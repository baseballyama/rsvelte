import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tag, TagSet } from "carbon-components-svelte";

var root = $.from_html(`<div style="max-width: 20rem;"><!></div>`);

export default function TagSetOverflow($$anchor) {
	const frameworks = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" },
		{ label: "Ember", type: "magenta" },
		{ label: "Preact", type: "cyan" },
		{ label: "Solid", type: "teal" },
		{ label: "Qwik", type: "cool-gray" },
		{ label: "Lit", type: "warm-gray" },
		{ label: "Alpine", type: "outline" }
	];

	var div = root();
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
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}