import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Text as TitleText } from '@threlte/extras';
import { Container, Content, Text } from 'threlte-uikit';
import { Button } from 'threlte-uikit/kit';

export default function Menu($$renderer, $$props) {
	let { onstart } = $$props;
	let titleRef = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, 1.5, -0.8],
				children: ($$renderer) => {
					Container($$renderer, {
						anchorX: 'center',
						anchorY: 'center',
						pixelSize: 0.002,
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 16,
						padding: 32,
						backgroundColor: '#0e1625',
						borderColor: 'hotpink',
						borderWidth: 3,
						borderRadius: 16,
						children: ($$renderer) => {
							Content($$renderer, {
								width: 320,
								height: 80,
								get ref() {
									return titleRef;
								},

								set ref($$value) {
									titleRef = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									TitleText($$renderer, {
										anchorX: 'center',
										anchorY: 'middle',
										text: 'bonksaber!',
										font: '/fonts/adrip1.ttf',
										color: 'red',
										fontSize: 1,
										onsync: () => titleRef?.notifyAncestorsChanged()
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								text: 'objective: bonk the cubes as they fly by',
								fontSize: 16,
								color: 'white'
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								onclick: onstart,
								size: 'lg',
								children: ($$renderer) => {
									Text($$renderer, { text: 'Start', fontSize: 22, color: '#555' });
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}