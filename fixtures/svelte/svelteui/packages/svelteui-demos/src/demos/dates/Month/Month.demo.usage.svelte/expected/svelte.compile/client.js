import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Text, Stack, Paper } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';

const code = `
<script>
    import { Month } from '@svelteuidev/dates';

    let value = new Date();
<\/script>

<Month bind:value month={value} onChange={(val) => (value = val)} />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div><!></div> <!>`, 1);

export default function Month_demo_usage($$anchor, $$props) {
	$.push($$props, true);

	let value = new Date();
	const mx = 'margin-left:auto;margin-right:auto;';

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div = $.first_child(fragment_2);

					$.set_style(div, 'width:max-content;margin-left:auto;margin-right:auto;');

					var node = $.child(div);

					Month(node, {
						get month() {
							return value;
						},
						onChange: (val) => value = val,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
						}
					});

					$.reset(div);

					var node_1 = $.sibling(div, 2);

					Text(node_1, {
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, value));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}