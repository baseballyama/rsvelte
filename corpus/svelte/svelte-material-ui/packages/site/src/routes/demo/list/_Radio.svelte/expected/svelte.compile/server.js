import * as $ from 'svelte/internal/server';
import List, { Item, Graphic, Label } from '@smui/list';
import Radio from '@smui/radio';

export default function _Radio($$renderer) {
	let selected = 'Tom Hanks';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-11gtsfb">`);

		List($$renderer, {
			class: 'demo-list',
			radioList: true,
			children: ($$renderer) => {
				Item($$renderer, {
					children: ($$renderer) => {
						Graphic($$renderer, {
							children: ($$renderer) => {
								Radio($$renderer, {
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

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Bruce Willis`);
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
						Graphic($$renderer, {
							children: ($$renderer) => {
								Radio($$renderer, {
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

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tom Hanks`);
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
						Graphic($$renderer, {
							children: ($$renderer) => {
								Radio($$renderer, {
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

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Jack Nicholson`);
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
						Graphic($$renderer, {
							children: ($$renderer) => {
								Radio($$renderer, {
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

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Leonardo DiCaprio`);
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
						Graphic($$renderer, {
							children: ($$renderer) => {
								Radio($$renderer, {
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

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Matt Damon`);
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

		$$renderer.push(`<!----></div> <pre class="status svelte-11gtsfb">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}