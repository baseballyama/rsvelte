import * as $ from 'svelte/internal/server';
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

export default function Collapse_demo_nested($$renderer) {
	let open = false;
	let openInside = false;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle collapse`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Collapse($$renderer, {
				open,
				children: ($$renderer) => {
					Paper($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Please click below to toggle a nested collapse! `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Toggle nested collapse`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Collapse($$renderer, {
								open: openInside,
								children: ($$renderer) => {
									Paper($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->This is a very hidden text, sshhhh!`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>Footer text</div>`);
		},
		$$slots: { default: true }
	});
}