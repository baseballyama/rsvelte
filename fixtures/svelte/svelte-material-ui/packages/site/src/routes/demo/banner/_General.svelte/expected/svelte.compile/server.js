import * as $ from 'svelte/internal/server';
import Banner, { Label, CloseReason } from '@smui/banner';
import Button from '@smui/button';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

export default function _General($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let centered = false;
		let mobileStacked = true;

		const closedReasons = {
			[CloseReason.PRIMARY]: 'Primary',
			[CloseReason.SECONDARY]: 'Secondary',
			[CloseReason.UNSPECIFIED]: 'Unspecified'
		};

		let closedReason = 'None yet';

		function handleBannerClosed(event) {
			closedReason = closedReasons[event.detail.reason];
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div>`);

			{
				function label($$renderer) {
					$$renderer.push(`<!---->Open`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							get checked() {
								return open;
							},

							set checked($$value) {
								open = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function label($$renderer) {
					$$renderer.push(`<!---->Centered`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							get checked() {
								return centered;
							},

							set checked($$value) {
								centered = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function label($$renderer) {
					$$renderer.push(`<!---->Mobile Stacked`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							get checked() {
								return mobileStacked;
							},

							set checked($$value) {
								mobileStacked = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$$renderer.push(`<!----></div> <pre class="status">Closed Reason: ${$.escape(closedReason)}</pre> <div class="top-app-bar-container">`);

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
							$$renderer.push(`<!---->This is a banner with no icon and some actions.`);
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
					centered,
					mobileStacked,
					onSMUIBannerClosed: handleBannerClosed,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					label,
					actions,
					$$slots: { label: true, actions: true }
				});
			}

			$$renderer.push(`<!----> <div><img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}