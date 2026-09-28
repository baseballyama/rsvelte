import * as $ from 'svelte/internal/server';
import Banner, { Label } from '@smui/banner';
import Button from '@smui/button';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

export default function _DisableAutoClose($$renderer) {
	const actions = { [0]: 'Primary', [1]: 'Secondary', [2]: 'Unknown' };
	let action = 'None yet';

	function handleActionClicked(event) {
		action = actions[event.detail.action];
	}

	$$renderer.push(`<pre class="status">Action Clicked: ${$.escape(action)}</pre> <div class="top-app-bar-container">`);

	TopAppBar($$renderer, {
		variant: 'static',
		children: ($$renderer) => {
			Row($$renderer, {
				children: ($$renderer) => {
					Section($$renderer, {
						children: ($$renderer) => {
							Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Top App Bar`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function label($$renderer) {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a banner with actions to click.`);
				},
				$$slots: { default: true }
			});
		}

		function actions($$renderer) {
			Button($$renderer, {
				secondary: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		Banner($$renderer, {
			open: true,
			autoClose: false,
			onSMUIBannerActionClicked: handleActionClicked,
			label,
			actions,
			$$slots: { label: true, actions: true }
		});
	}

	$$renderer.push(`<!----> <div><img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div>`);
}