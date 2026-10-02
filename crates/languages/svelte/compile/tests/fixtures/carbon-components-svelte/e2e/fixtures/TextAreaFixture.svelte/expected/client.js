import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextArea } from "carbon-components-svelte";

export default function TextAreaFixture($$anchor) {
	let value = "";

	TextArea($$anchor, {
		'data-testid': 'text-area-comment',
		labelText: 'Comment',
		placeholder: 'Enter your comment',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});
}