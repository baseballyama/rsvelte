import * as $ from 'svelte/internal/server';
import { Checkbox, Stack, Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsConditional($$renderer) {
	let selected = 0;
	let showAdminTab = true;
	let showSettingsTab = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 3,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Checkbox($$renderer, {
					labelText: 'Show Admin tab',
					get checked() {
						return showAdminTab;
					},

					set checked($$value) {
						showAdminTab = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					labelText: 'Show Settings tab',
					get checked() {
						return showSettingsTab;
					},

					set checked($$value) {
						showSettingsTab = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div><strong>Selected index:</strong> ${$.escape(selected)}</div> `);

				Tabs($$renderer, {
					get selected() {
						return selected;
					},

					set selected($$value) {
						selected = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Tab($$renderer, { label: 'Dashboard' });
						$$renderer.push(`<!----> `);

						if (showAdminTab) {
							$$renderer.push('<!--[0-->');
							Tab($$renderer, { label: 'Admin' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (showSettingsTab) {
							$$renderer.push('<!--[0-->');
							Tab($$renderer, { label: 'Settings' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						Tab($$renderer, { label: 'Profile' });
						$$renderer.push(`<!---->`);
					},

					$$slots: {
						default: true,
						content: ($$renderer) => {
							{
								TabContent($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<p>Dashboard content with analytics and overview.</p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (showAdminTab) {
									$$renderer.push('<!--[0-->');

									TabContent($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<p>Admin panel for managing users and permissions.</p>`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (showSettingsTab) {
									$$renderer.push('<!--[0-->');

									TabContent($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<p>Settings and configuration options.</p>`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								TabContent($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<p>User profile and account information.</p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}