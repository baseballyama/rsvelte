import * as $ from 'svelte/internal/server';

import {
	Kbd,
	Table,
	TableHead,
	TableHeadCell,
	TableBody,
	TableBodyCell,
	TableBodyRow
} from "flowbite-svelte";

import {
	CaretUpSolid,
	CaretDownSolid,
	CaretRightSolid,
	CaretLeftSolid
} from "flowbite-svelte-icons";

export default function Table_1($$renderer) {
	Table($$renderer, {
		children: ($$renderer) => {
			TableHead($$renderer, {
				children: ($$renderer) => {
					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Key`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Description`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				class: 'divide-y',
				children: ($$renderer) => {
					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Kbd($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Shift`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> or `);

									Kbd($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Tab`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Navigate to interactive elements`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Kbd($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Enter`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> or `);

									Kbd($$renderer, {
										class: 'px-4 py-1.5',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Space bar`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Ensure elements with ARIA role="button" can be activated with both key commands.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Kbd($$renderer, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$renderer) => {
											CaretUpSolid($$renderer, {});
											$$renderer.push(`<!----> <span class="sr-only">Arrow key up</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Kbd($$renderer, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$renderer) => {
											CaretDownSolid($$renderer, {});
											$$renderer.push(`<!----> <span class="sr-only">Arrow key down</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> or `);

									Kbd($$renderer, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$renderer) => {
											CaretLeftSolid($$renderer, {});
											$$renderer.push(`<!----> <span class="sr-only">Arrow key left</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Kbd($$renderer, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$renderer) => {
											CaretRightSolid($$renderer, {});
											$$renderer.push(`<!----> <span class="sr-only">Arrow key right</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Choose and activate previous/next tab.`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}