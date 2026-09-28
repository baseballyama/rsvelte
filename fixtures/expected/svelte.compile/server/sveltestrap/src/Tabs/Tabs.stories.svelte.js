import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Icon, TabContent, TabPane } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Tabs',
	parameters: {},
	argTypes: {},
	args: {}
};

export default function Tabs_stories($$renderer) {
	let status = 'alpha';

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="tab-example">`);

				TabContent($$renderer, {
					children: ($$renderer) => {
						TabPane($$renderer, {
							class: 'pt-3',
							tabId: 'alpha',
							tab: 'Alpha',
							active: true,
							children: ($$renderer) => {
								$$renderer.push(`<h2 class="text-content">Alpha</h2> <img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabPane($$renderer, {
							class: 'pt-3',
							tabId: 'bravo',
							tab: 'Bravo',
							children: ($$renderer) => {
								$$renderer.push(`<h2 class="text-content">Bravo</h2> <img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabPane($$renderer, {
							class: 'pt-3',
							tabId: 'charlie',
							tab: 'Charlie',
							children: ($$renderer) => {
								$$renderer.push(`<h2 class="text-content">Charlie</h2> <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Pills',
		children: ($$renderer) => {
			TabContent($$renderer, {
				pills: true,
				children: ($$renderer) => {
					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
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

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Disabled',
		children: ($$renderer) => {
			$$renderer.push(`<div class="tab-example">`);

			TabContent($$renderer, {
				class: 'disabled-tab',
				pills: true,
				children: ($$renderer) => {
					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Slots',
		children: ($$renderer) => {
			TabContent($$renderer, {
				children: ($$renderer) => {
					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'alpha',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
						},

						$$slots: {
							default: true,
							tab: ($$renderer) => {
								$$renderer.push(`<span slot="tab">Alpha `);
								Icon($$renderer, { name: 'gear' });
								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'bravo',
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
						},

						$$slots: {
							default: true,
							tab: ($$renderer) => {
								$$renderer.push(`<span slot="tab">Bravo `);
								Icon($$renderer, { name: 'hand-thumbs-up' });
								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'charlie',
						children: ($$renderer) => {
							$$renderer.push(`<img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
						},

						$$slots: {
							default: true,
							tab: ($$renderer) => {
								$$renderer.push(`<span slot="tab">Charlie `);
								Icon($$renderer, { name: 'alarm' });
								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Vertical',
		children: ($$renderer) => {
			$$renderer.push(`<div class="tab-example">`);

			TabContent($$renderer, {
				vertical: true,
				pills: true,
				children: ($$renderer) => {
					TabPane($$renderer, {
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Alpha</h2> <img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Bravo</h2> <img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Charlie</h2> <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			$$renderer.push(`<div class="tab-example"><h5 class="text-content">Current state: ${$.escape(status)}</h5> `);

			TabContent($$renderer, {
				class: 'pt-3',
				children: ($$renderer) => {
					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Alpha</h2>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Bravo</h2>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPane($$renderer, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="text-content">Charlie</h2>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}