import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '@svelteuidev/core';

const code = `<script>
    import { Input } from '@svelteuidev/core';
<\/script>

<Input root="button">Button input</Input>
<Input root="select">
    <option value="1">1</option>
    <option value="2">2</option>
</Input>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<option>1</option> <option>2</option>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input_demo_custom($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Input(node, {
		root: 'button',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		root: 'select',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var option = $.first_child(fragment_1);

			option.value = option.__value = '1';

			var option_1 = $.sibling(option, 2);

			option_1.value = option_1.__value = '2';
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}