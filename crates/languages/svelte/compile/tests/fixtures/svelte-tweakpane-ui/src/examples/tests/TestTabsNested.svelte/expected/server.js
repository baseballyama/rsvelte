import * as $ from 'svelte/internal/server';
import { Button, Pane, TabGroup, TabPage } from '$lib';

export default function TestTabsNested($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let mode = 0;

	let tabIndexA = 0;
	let tabIndexB = 1;

	function cycleMode() {
		mode = (mode + 1) % 3;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>Mode: ${$.escape(mode)}</p> <p>TabIndexA: ${$.escape(tabIndexA)}</p> <p>TabIndexB: ${$.escape(tabIndexB)}</p> `);

		if (mode === 0) {
			$$renderer.push('<!--[0-->');

			Pane($$renderer, {
				position: 'draggable',
				storePositionLocally: false,
				title: 'Controls',
				children: ($$renderer) => {
					TabGroup($$renderer, {
						get selectedIndex() {
							return tabIndexA;
						},

						set selectedIndex($$value) {
							tabIndexA = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							TabPage($$renderer, {
								title: 'A',
								children: ($$renderer) => {
									TabGroup($$renderer, {
										get selectedIndex() {
											return tabIndexB;
										},

										set selectedIndex($$value) {
											tabIndexB = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											TabPage($$renderer, {
												title: 'A',
												children: ($$renderer) => {
													Button($$renderer, { title: 'Cycle Mode' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TabPage($$renderer, {
												title: 'B',
												children: ($$renderer) => {
													Button($$renderer, { title: 'Cycle Mode' });
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

							TabPage($$renderer, {
								title: 'B',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
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
		} else if (mode === 1) {
			$$renderer.push('<!--[1-->');

			Pane($$renderer, {
				position: 'inline',
				title: 'Controls',
				children: ($$renderer) => {
					TabGroup($$renderer, {
						get selectedIndex() {
							return tabIndexA;
						},

						set selectedIndex($$value) {
							tabIndexA = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							TabPage($$renderer, {
								title: 'A',
								children: ($$renderer) => {
									TabGroup($$renderer, {
										get selectedIndex() {
											return tabIndexB;
										},

										set selectedIndex($$value) {
											tabIndexB = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											TabPage($$renderer, {
												title: 'A',
												children: ($$renderer) => {
													Button($$renderer, { title: 'Cycle Mode' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TabPage($$renderer, {
												title: 'B',
												children: ($$renderer) => {
													Button($$renderer, { title: 'Cycle Mode' });
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

							TabPage($$renderer, {
								title: 'B',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
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
		} else {
			$$renderer.push(`<!--[-1--><p>No pane</p>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}