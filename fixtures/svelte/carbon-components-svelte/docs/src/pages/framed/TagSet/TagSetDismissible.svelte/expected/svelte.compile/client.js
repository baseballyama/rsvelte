import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tag, TagSet } from "carbon-components-svelte";

export default function TagSetDismissible($$anchor) {
	let tags = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" }
	];

	function handleTagClose({ detail }) {
		tags = tags.filter((_, index) => index !== detail.index);
	}

	TagSet($$anchor, {
		$$events: { 'close:tag': handleTagClose },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => tags, $.index, ($$anchor, tag) => {
				Tag($$anchor, {
					get type() {
						return $.get(tag).type;
					},
					filter: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(tag).label));
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