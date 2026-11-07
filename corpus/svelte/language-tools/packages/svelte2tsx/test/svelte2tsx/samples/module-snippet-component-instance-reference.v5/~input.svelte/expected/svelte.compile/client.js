import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	const iconSnippet = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => $$props.icon, ($$anchor, Icon_1) => {
			Icon_1($$anchor, { size: 16 });
		});

		$.append($$anchor, fragment);
	};

	iconSnippet($$anchor);
}