import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Collapse, Paper, Stack } from '@svelteuidev/core';

const code = `
<script>
	import { Button, Collapse, Paper } from '@svelteuidev/core';

  let open = false;
  let openInside = false;
<\/script>

<Button
  on:click={() => {
    open = !open;
  }}>Toggle collapse</Button
>
<Collapse {open}>
  <Paper>
    Please click below to toggle a nested collapse!
    <Button
      on:click={() => {
        openInside = !openInside;
      }}>Toggle nested collapse</Button
    >

    <Collapse open={openInside}>
      <Paper>This is a very hidden text, sshhhh!</Paper>
    </Collapse>
  </Paper>
</Collapse>
<div>Footer text</div>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`Please click below to toggle a nested collapse! <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div>Footer text</div>`, 1);

export default function Collapse_demo_nested($$anchor) {
	let open = false;
	let openInside = false;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Button(node, {
				$$events: {
					click: () => {
						open = !open;
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Toggle collapse');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Collapse(node_1, {
				get open() {
					return open;
				},

				children: ($$anchor, $$slotProps) => {
					Paper($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_2 = $.sibling($.first_child(fragment_3));

							Button(node_2, {
								$$events: {
									click: () => {
										openInside = !openInside;
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Toggle nested collapse');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Collapse(node_3, {
								get open() {
									return openInside;
								},

								children: ($$anchor, $$slotProps) => {
									Paper($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('This is a very hidden text, sshhhh!');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}