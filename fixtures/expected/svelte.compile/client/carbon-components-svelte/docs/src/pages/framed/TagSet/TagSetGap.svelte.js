import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tag, TagSet } from "carbon-components-svelte";

export default function TagSetGap($$anchor) {
	const frameworks = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" }
	];

	TagSet($$anchor, {
		gap: '1.5rem',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => frameworks, $.index, ($$anchor, framework) => {
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}