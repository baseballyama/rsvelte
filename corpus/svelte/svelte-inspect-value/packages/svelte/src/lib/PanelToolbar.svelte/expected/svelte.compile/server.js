import * as $ from 'svelte/internal/server';
import NodeIconButton from './components/NodeIconButton.svelte';
import Select from './components/Select.svelte';
import * as icons from './components/icons/index.js';

export default function PanelToolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			fullScreen = false,
			opacity,
			xPos,
			yPos,
			appearance = 'solid',
			showResetButton,
			onReset,
			toggleOpacity,
			settingsChanged,
			onAlignChange
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(['toolbar', yPos]), 'svelte-om6l88')}><div class="group svelte-om6l88">`);

			NodeIconButton($$renderer, {
				title: 'Toggle full view',
				onclick: () => fullScreen = !fullScreen,
				children: ($$renderer) => {
					if (fullScreen) {
						$$renderer.push('<!--[0-->');

						if (icons.FullscreenExit) {
							$$renderer.push('<!--[-->');
							icons.FullscreenExit($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');

						if (icons.Fullscreen) {
							$$renderer.push('<!--[-->');
							icons.Fullscreen($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (!fullScreen) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					title: 'Toggle opacity',
					onclick: toggleOpacity,
					children: ($$renderer) => {
						if (opacity) {
							$$renderer.push('<!--[0-->');

							if (icons.Opacity) {
								$$renderer.push('<!--[-->');
								icons.Opacity($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');

							if (icons.Circle) {
								$$renderer.push('<!--[-->');
								icons.Circle($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showResetButton) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					title: 'Reset size',
					onclick: onReset,
					children: ($$renderer) => {
						if (icons.ResetResize) {
							$$renderer.push('<!--[-->');
							icons.ResetResize($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="group svelte-om6l88">`);

			if (!fullScreen) {
				$$renderer.push('<!--[0-->');

				Select($$renderer, {
					prefix: 'x',
					name: 'x-position',
					title: 'Set x-position',
					value: xPos,
					onchange: (e) => onAlignChange(e.currentTarget.value, yPos),
					children: ($$renderer) => {
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`left`);
						});

						$$renderer.push(` `);

						$$renderer.option({ disabled: ['middle', 'full'].includes(yPos) }, ($$renderer) => {
							$$renderer.push(`center`);
						});

						$$renderer.push(` `);

						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`right`);
						});

						$$renderer.push(` `);

						$$renderer.option({ disabled: ['middle', 'full'].includes(yPos) }, ($$renderer) => {
							$$renderer.push(`full`);
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Select($$renderer, {
					prefix: 'y',
					name: 'y-position',
					title: 'Set y-position',
					value: yPos,
					onchange: (e) => onAlignChange(xPos, e.currentTarget.value),
					children: ($$renderer) => {
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`top`);
						});

						$$renderer.push(` `);

						$$renderer.option({ disabled: ['full', 'center'].includes(xPos) }, ($$renderer) => {
							$$renderer.push(`middle`);
						});

						$$renderer.push(` `);

						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`bottom`);
						});

						$$renderer.push(` `);

						$$renderer.option({ disabled: ['center', 'full'].includes(xPos) }, ($$renderer) => {
							$$renderer.push(`full`);
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Select($$renderer, {
				name: 'appearance',
				onchange: () => settingsChanged(['appearance']),
				get value() {
					return appearance;
				},

				set value($$value) {
					appearance = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`solid`);
					});

					$$renderer.push(` `);

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`dense`);
					});

					$$renderer.push(` `);

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`glassy`);
					});

					$$renderer.push(` `);

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`floating`);
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { fullScreen, appearance });
	});
}