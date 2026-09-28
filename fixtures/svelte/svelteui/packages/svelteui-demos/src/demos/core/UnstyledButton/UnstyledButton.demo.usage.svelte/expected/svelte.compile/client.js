import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text, Group, UnstyledButton, ThemeIcon, Kbd } from '@svelteuidev/core';
import { useOs } from '@svelteuidev/composables';

const code = `
<script>
    import { UnstyledButton, ThemeIcon, Text, Group } from '@svelteuidev/core';
<\/script>

<Group position="center">
	<UnstyledButton aria-label="Open user menu" onClick={() => {}}>
		<Group>
			<ThemeIcon size={40} color="blue" variant="outline">BH</ThemeIcon>
			<div>
				<Text>Bob Handsome</Text>
				<Text size="xs" color="dimmed">bob@handsome.inc</Text>
			</div>
		</Group>
	</UnstyledButton>
</Group>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <div><!> <!></div>`, 1);
var root_1 = $.from_html(`Try clicking <!> to focus the button!`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function UnstyledButton_demo_usage($$anchor, $$props) {
	$.push($$props, true);

	const os = useOs();
	const isDesktop = os === 'macos' || os === 'windows' || os === 'linux' ? true : false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Group(node, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			UnstyledButton($$anchor, {
				'aria-label': 'Open user menu',
				children: ($$anchor, $$slotProps) => {
					Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							ThemeIcon(node_1, {
								size: 40,
								color: 'blue',
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('BH');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var div = $.sibling(node_1, 2);
							var node_2 = $.child(div);

							Text(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Bob Handsome');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Text(node_3, {
								size: 'xs',
								color: 'dimmed',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('bob@handsome.inc');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Text($$anchor, {
				override: { mt: '$10' },
				align: 'center',
				weight: 'bold',
				tracking: 'tight',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root_1();
					var node_5 = $.sibling($.first_child(fragment_5));

					Kbd(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('tab');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if (isDesktop) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}