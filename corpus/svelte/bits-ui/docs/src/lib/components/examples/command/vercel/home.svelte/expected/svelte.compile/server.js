import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

import {
	ContactIcon,
	DocsIcon,
	FeedbackIcon,
	PlusIcon,
	ProjectsIcon,
	TeamsIcon
} from "./icons/index.js";

import Item from "./item.svelte";

export default function Home($$renderer, $$props) {
	let { searchProjects } = $$props;

	if (Command.Group) {
		$$renderer.push('<!--[-->');

		Command.Group($$renderer, {
			children: ($$renderer) => {
				if (Command.GroupHeading) {
					$$renderer.push('<!--[-->');

					Command.GroupHeading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Projects`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Command.GroupItems) {
					$$renderer.push('<!--[-->');

					Command.GroupItems($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								shortcut: 'S P',
								onSelect: searchProjects,
								value: 'Search Projects...',
								children: ($$renderer) => {
									ProjectsIcon($$renderer, {});
									$$renderer.push(`<!----> Search Projects...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								value: 'Create New Project...',
								children: ($$renderer) => {
									PlusIcon($$renderer, {});
									$$renderer.push(`<!----> Create New Project...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Command.Group) {
		$$renderer.push('<!--[-->');

		Command.Group($$renderer, {
			children: ($$renderer) => {
				if (Command.GroupHeading) {
					$$renderer.push('<!--[-->');

					Command.GroupHeading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Teams`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Command.GroupItems) {
					$$renderer.push('<!--[-->');

					Command.GroupItems($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								shortcut: '⇧ P',
								value: 'Search Teams...',
								children: ($$renderer) => {
									TeamsIcon($$renderer, {});
									$$renderer.push(`<!----> Search Teams...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								value: 'Create New Team...',
								children: ($$renderer) => {
									PlusIcon($$renderer, {});
									$$renderer.push(`<!----> Create New Team...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Command.Group) {
		$$renderer.push('<!--[-->');

		Command.Group($$renderer, {
			children: ($$renderer) => {
				if (Command.GroupHeading) {
					$$renderer.push('<!--[-->');

					Command.GroupHeading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Help`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Command.GroupItems) {
					$$renderer.push('<!--[-->');

					Command.GroupItems($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								shortcut: '⇧ D',
								value: 'Search Docs...',
								children: ($$renderer) => {
									DocsIcon($$renderer, {});
									$$renderer.push(`<!----> Search Docs...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								value: 'Send Feedback...',
								children: ($$renderer) => {
									FeedbackIcon($$renderer, {});
									$$renderer.push(`<!----> Send Feedback...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								value: 'Contact Support',
								children: ($$renderer) => {
									ContactIcon($$renderer, {});
									$$renderer.push(`<!----> Contact Support`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}