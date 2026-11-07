import * as $ from 'svelte/internal/server';
import List, { Item, Meta, Label } from '@smui/list';
import Checkbox from '@smui/checkbox';

export default function _Check($$renderer) {
	let selected = ['Tom Hanks'];
	let changeEvent = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1wd4xne">`);

		List($$renderer, {
			class: 'demo-list',
			checkList: true,
			onSMUIListSelectionChange: (event) => changeEvent = event,
			children: ($$renderer) => {
				Item($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Bruce Willis`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Meta($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									value: 'Bruce Willis',
									get group() {
										return selected;
									},

									set group($$value) {
										selected = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Item($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tom Hanks`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Meta($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									value: 'Tom Hanks',
									get group() {
										return selected;
									},

									set group($$value) {
										selected = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Item($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Jack Nicholson`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Meta($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									value: 'Jack Nicholson',
									get group() {
										return selected;
									},

									set group($$value) {
										selected = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Item($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Leonardo DiCaprio`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Meta($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									value: 'Leonardo DiCaprio',
									get group() {
										return selected;
									},

									set group($$value) {
										selected = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Item($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Matt Damon`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Meta($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									value: 'Matt Damon',
									get group() {
										return selected;
									},

									set group($$value) {
										selected = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status svelte-1wd4xne">Selected: ${$.escape(selected.join(', '))}</pre> <pre class="status svelte-1wd4xne">Change Event Detail: ${$.escape(changeEvent ? JSON.stringify(changeEvent.detail) : 'No change yet.')}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}