import * as $ from 'svelte/internal/server';
import { SplitPane, Pane, SidebarGroup, SidebarItem } from "$lib";
import { ChartOutline, GridSolid, MailBoxSolid, UserSolid } from "flowbite-svelte-icons";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let basicSizes = [];
		let basicWithSidebarSizes = [];
		let verticalSizes = [];
		let threePaneSizes = [];
		let responsiveSizes = [];
		let nestedSizes = [];
		let constrainedSizes = [];
		let editorSizes = [];
		let basicContainerWidth = 0;
		let basicWithSidebarWidth = 0;
		let verticalContainerHeight = 0;
		let threePaneContainerWidth = 0;
		let responsiveContainerWidth = 0;
		let nestedContainerWidth = 0;
		let constrainedContainerWidth = 0;
		let editorContainerWidth = 0;
		let basicContainerElement;
		let basicWithSidebarElement;
		let verticalContainerElement;
		let threePaneContainerElement;
		let responsiveContainerElement;
		let nestedContainerElement;
		let constrainedContainerElement;
		let editorContainerElement;
		const spanClass = "flex-1 ms-3 whitespace-nowrap";

		function handleBasicResize(newSizes) {
			basicSizes = newSizes;
			updateBasicContainerWidth();
		}

		function handleBasicWithSidebarResize(newSizes) {
			basicWithSidebarSizes = newSizes;
			updateBasicWithSidebarWidth();
		}

		function handleVerticalResize(newSizes) {
			verticalSizes = newSizes;
			updateVerticalContainerHeight();
		}

		function handleThreePaneResize(newSizes) {
			threePaneSizes = newSizes;
			updateThreePaneContainerWidth();
		}

		function handleResponsiveResize(newSizes) {
			responsiveSizes = newSizes;
			updateResponsiveContainerWidth();
		}

		function handleNestedResize(newSizes) {
			nestedSizes = newSizes;
			updateNestedContainerWidth();
		}

		function handleConstrainedResize(newSizes) {
			constrainedSizes = newSizes;
			updateConstrainedContainerWidth();
		}

		function handleEditorResize(newSizes) {
			editorSizes = newSizes;
			updateEditorContainerWidth();
		}

		function updateBasicContainerWidth() {
			if (basicContainerElement) {
				basicContainerWidth = basicContainerElement.offsetWidth;
			}
		}

		function updateBasicWithSidebarWidth() {
			if (basicWithSidebarElement) {
				basicWithSidebarWidth = basicWithSidebarElement.offsetWidth;
			}
		}

		function updateVerticalContainerHeight() {
			if (verticalContainerElement) {
				verticalContainerHeight = verticalContainerElement.offsetHeight;
			}
		}

		function updateThreePaneContainerWidth() {
			if (threePaneContainerElement) {
				threePaneContainerWidth = threePaneContainerElement.offsetWidth;
			}
		}

		function updateResponsiveContainerWidth() {
			if (responsiveContainerElement) {
				responsiveContainerWidth = responsiveContainerElement.offsetWidth;
			}
		}

		function updateNestedContainerWidth() {
			if (nestedContainerElement) {
				nestedContainerWidth = nestedContainerElement.offsetWidth;
			}
		}

		function updateConstrainedContainerWidth() {
			if (constrainedContainerElement) {
				constrainedContainerWidth = constrainedContainerElement.offsetWidth;
			}
		}

		function updateEditorContainerWidth() {
			if (editorContainerElement) {
				editorContainerWidth = editorContainerElement.offsetWidth;
			}
		}

		function getPixels(percent, containerSize) {
			return Math.round(percent / 100 * containerSize);
		}

		$$renderer.push(`<div class="bg-gray-100"><div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Basic Horizontal Split</h2> <p class="dark:text-white">Simple two-pane horizontal layout with draggable divider. Demonstrates core resizing functionality with visual feedback showing percentage and pixel widths.</p> `);

		if (basicSizes.length > 0 && basicContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(basicContainerWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Left: ${$.escape(basicSizes[0].toFixed(1))}% (${$.escape(getPixels(basicSizes[0], basicContainerWidth))}px)</span> <span class="ml-3">Right: ${$.escape(basicSizes[1].toFixed(1))}% (${$.escape(getPixels(basicSizes[1], basicContainerWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			responsive: false,
			onResize: handleBasicResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Left Pane</h3> <p>This is the left pane content. Drag the divider to resize!</p> `);

						if (basicSizes.length > 0 && basicContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(basicSizes[0].toFixed(2))}% = ${$.escape(getPixels(basicSizes[0], basicContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Right Pane</h3> <p>This is the right pane content.</p> `);

						if (basicSizes.length > 0 && basicContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(basicSizes[1].toFixed(2))}% = ${$.escape(getPixels(basicSizes[1], basicContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Basic Horizontal Split with Sidebar</h2> <p class="dark:text-white">Two-pane horizontal layout with minSize of 200 and initialSizes of [25,75] and Sidebar components on the left pane.</p> `);

		if (basicWithSidebarSizes.length > 0 && basicWithSidebarWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(basicWithSidebarWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Left: ${$.escape(basicWithSidebarSizes[0].toFixed(1))}% (${$.escape(getPixels(basicWithSidebarSizes[0], basicWithSidebarWidth))}px)</span> <span class="ml-3">Right: ${$.escape(basicWithSidebarSizes[1].toFixed(1))}% (${$.escape(getPixels(basicWithSidebarSizes[1], basicWithSidebarWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			minSize: 200,
			initialSizes: [25, 75],
			responsive: false,
			onResize: handleBasicWithSidebarResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Left Pane</h3> `);

						SidebarGroup($$renderer, {
							children: ($$renderer) => {
								{
									function icon($$renderer) {
										ChartOutline($$renderer, {
											class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
										});
									}

									SidebarItem($$renderer, { label: 'Dashboard', href: '/', icon, $$slots: { icon: true } });
								}

								$$renderer.push(`<!----> `);

								{
									function icon($$renderer) {
										GridSolid($$renderer, {
											class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
										});
									}

									function subtext($$renderer) {
										$$renderer.push(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pro</span>`);
									}

									SidebarItem($$renderer, {
										label: 'Kanban',
										spanClass,
										href: '/',
										icon,
										subtext,
										$$slots: { icon: true, subtext: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function icon($$renderer) {
										MailBoxSolid($$renderer, {
											class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
										});
									}

									function subtext($$renderer) {
										$$renderer.push(`<span class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
									}

									SidebarItem($$renderer, {
										label: 'Inbox',
										spanClass,
										href: '/',
										icon,
										subtext,
										$$slots: { icon: true, subtext: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function icon($$renderer) {
										UserSolid($$renderer, {
											class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
										});
									}

									SidebarItem($$renderer, {
										label: 'Sidebar',
										href: '/components/sidebar',
										icon,
										$$slots: { icon: true }
									});
								}

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Right Pane</h3> <p>This is the right pane content. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit nulla ipsum inventore nihil labore in velit dolores consequatur, voluptas praesentium
              perferendis nobis sequi culpa laboriosam natus! Dignissimos exercitationem vitae necessitatibus.</p></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Vertical Split (30/70)</h2> <p class="dark:text-white">Vertical layout with custom initial sizes and keyboard controls. Use arrow keys to adjust, Enter/Space to reset to equal distribution.</p> `);

		if (verticalSizes.length > 0 && verticalContainerHeight > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(verticalContainerHeight)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Top: ${$.escape(verticalSizes[0].toFixed(1))}% (${$.escape(getPixels(verticalSizes[0], verticalContainerHeight))}px)</span> <span class="ml-3">Bottom: ${$.escape(verticalSizes[1].toFixed(1))}% (${$.escape(getPixels(verticalSizes[1], verticalContainerHeight))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			direction: 'vertical',
			initialSizes: [30, 70],
			minSize: 50,
			responsive: false,
			onResize: handleVerticalResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-purple-50 p-4"><h3 class="font-semibold">Top Pane (30%)</h3> <p>Tab to the divider and use arrow keys (↑/↓) for keyboard control.</p> `);

						if (verticalSizes.length > 0 && verticalContainerHeight > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Height: ${$.escape(verticalSizes[0].toFixed(2))}% = ${$.escape(getPixels(verticalSizes[0], verticalContainerHeight))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-yellow-50 p-4"><h3 class="font-semibold">Bottom Pane (70%)</h3> <p>Press Enter or Space on divider to reset to equal sizes.</p> `);

						if (verticalSizes.length > 0 && verticalContainerHeight > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Height: ${$.escape(verticalSizes[1].toFixed(2))}% = ${$.escape(getPixels(verticalSizes[1], verticalContainerHeight))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Three Panes</h2> <p class="dark:text-white">Multiple panes in single container with individual dividers. Each pane can be resized independently while maintaining minimum size constraints.</p> `);

		if (threePaneSizes.length > 0 && threePaneContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(threePaneContainerWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Pane 1: ${$.escape(threePaneSizes[0].toFixed(1))}% (${$.escape(getPixels(threePaneSizes[0], threePaneContainerWidth))}px)</span> <span class="ml-3">Pane 2: ${$.escape(threePaneSizes[1].toFixed(1))}% (${$.escape(getPixels(threePaneSizes[1], threePaneContainerWidth))}px)</span> <span class="ml-3">Pane 3: ${$.escape(threePaneSizes[2].toFixed(1))}% (${$.escape(getPixels(threePaneSizes[2], threePaneContainerWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			minSize: 80,
			responsive: false,
			onResize: handleThreePaneResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-red-50 p-4"><h3 class="font-semibold">Pane 1</h3> <p>First pane</p> `);

						if (threePaneSizes.length > 0 && threePaneContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(threePaneSizes[0].toFixed(2))}% = ${$.escape(getPixels(threePaneSizes[0], threePaneContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Pane 2</h3> <p>Middle pane</p> `);

						if (threePaneSizes.length > 0 && threePaneContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(threePaneSizes[1].toFixed(2))}% = ${$.escape(getPixels(threePaneSizes[1], threePaneContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Pane 3</h3> <p>Last pane</p> `);

						if (threePaneSizes.length > 0 && threePaneContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(threePaneSizes[2].toFixed(2))}% = ${$.escape(getPixels(threePaneSizes[2], threePaneContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Responsive (switches to vertical on mobile)</h2> <p class="dark:text-white">Automatically switches between horizontal and vertical layouts based on viewport width. Features callback tracking for size change monitoring.</p> `);

		if (responsiveSizes.length > 0 && responsiveContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(responsiveContainerWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Pane A: ${$.escape(responsiveSizes[0].toFixed(1))}% (${$.escape(getPixels(responsiveSizes[0], responsiveContainerWidth))}px)</span> <span class="ml-3">Pane B: ${$.escape(responsiveSizes[1].toFixed(1))}% (${$.escape(getPixels(responsiveSizes[1], responsiveContainerWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			responsive: true,
			breakpoint: 768,
			onResize: handleResponsiveResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-indigo-50 p-4"><h3 class="font-semibold">Pane A</h3> <p>Resize your browser window to see the layout change from horizontal to vertical at 768px.</p> `);

						if (responsiveSizes.length > 0 && responsiveContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Size: ${$.escape(responsiveSizes[0].toFixed(2))}% = ${$.escape(getPixels(responsiveSizes[0], responsiveContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-pink-50 p-4"><h3 class="font-semibold">Pane B</h3> <p>The onResize callback tracks size changes shown above.</p> `);

						if (responsiveSizes.length > 0 && responsiveContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Size: ${$.escape(responsiveSizes[1].toFixed(2))}% = ${$.escape(getPixels(responsiveSizes[1], responsiveContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Nested Split Panes</h2> <p class="dark:text-white">Complex layout combining horizontal and vertical splits. Creates sidebar with vertically-split main content area for advanced dashboard layouts.</p> `);

		if (nestedSizes.length > 0 && nestedContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(nestedContainerWidth)}px <span class="ml-4"><strong>Outer Sizes:</strong></span> <span class="ml-2">Sidebar: ${$.escape(nestedSizes[0].toFixed(1))}% (${$.escape(getPixels(nestedSizes[0], nestedContainerWidth))}px)</span> <span class="ml-3">Main: ${$.escape(nestedSizes[1].toFixed(1))}% (${$.escape(getPixels(nestedSizes[1], nestedContainerWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			responsive: false,
			onResize: handleNestedResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-gray-50 p-4"><h3 class="font-semibold">Sidebar</h3> <p>Navigation or tools</p> `);

						if (nestedSizes.length > 0 && nestedContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(nestedSizes[0].toFixed(2))}% = ${$.escape(getPixels(nestedSizes[0], nestedContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						SplitPane($$renderer, {
							direction: 'vertical',
							transition: false,
							responsive: false,
							children: ($$renderer) => {
								Pane($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Top Content</h3> <p>Main content area</p></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Pane($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Bottom Content</h3> <p>Footer or additional info</p></div>`);
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">With Min Constraints (300px minimum)</h2> <p class="dark:text-white">Demonstrates minimum size enforcement. Panes cannot be resized below 300px, preventing content from becoming unusable during aggressive resizing.</p> `);

		if (constrainedSizes.length > 0 && constrainedContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(constrainedContainerWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Left: ${$.escape(constrainedSizes[0].toFixed(1))}% (${$.escape(getPixels(constrainedSizes[0], constrainedContainerWidth))}px)</span> <span class="ml-3">Right: ${$.escape(constrainedSizes[1].toFixed(1))}% (${$.escape(getPixels(constrainedSizes[1], constrainedContainerWidth))}px)</span> <span class="ml-4 text-blue-600"><strong>Min:</strong> ${$.escape((300 / constrainedContainerWidth * 100).toFixed(2))}%</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-96 rounded border">`);

		SplitPane($$renderer, {
			minSize: 300,
			initialSizes: [30, 70],
			responsive: false,
			onResize: handleConstrainedResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-orange-50 p-4"><h3 class="font-semibold">Constrained Pane</h3> <p class="mt-2 text-sm">This pane has:</p> <ul class="ml-5 list-disc text-sm"><li>Min size: <strong>300px</strong></li></ul> `);

						if (constrainedSizes.length > 0 && constrainedContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(constrainedSizes[0].toFixed(2))}% = ${$.escape(getPixels(constrainedSizes[0], constrainedContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full bg-teal-50 p-4"><h3 class="font-semibold">Flexible Pane</h3> <p>This pane takes up the remaining space.</p> `);

						if (constrainedSizes.length > 0 && constrainedContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border bg-white p-2 font-mono text-xs">Width: ${$.escape(constrainedSizes[1].toFixed(2))}% = ${$.escape(getPixels(constrainedSizes[1], constrainedContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Code Editor Layout</h2> <p class="dark:text-white">Production-ready IDE-style interface with file explorer, code editor, and terminal. Shows practical implementation with nested panes and dark theme.</p> `);

		if (editorSizes.length > 0 && editorContainerWidth > 0) {
			$$renderer.push(`<!--[0--><div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> ${$.escape(editorContainerWidth)}px <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2">Explorer: ${$.escape(editorSizes[0].toFixed(1))}% (${$.escape(getPixels(editorSizes[0], editorContainerWidth))}px)</span> <span class="ml-3">Editor: ${$.escape(editorSizes[1].toFixed(1))}% (${$.escape(getPixels(editorSizes[1], editorContainerWidth))}px)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="h-[600px] overflow-hidden rounded border">`);

		SplitPane($$renderer, {
			initialSizes: [20, 80],
			minSize: 150,
			responsive: false,
			onResize: handleEditorResize,
			children: ($$renderer) => {
				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-full overflow-auto bg-gray-900 p-4 text-white"><h3 class="mb-4 font-semibold">📁 Explorer</h3> <ul class="space-y-1 text-sm"><li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 index.html</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 styles.css</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 script.js</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 App.svelte</li></ul> `);

						if (editorSizes.length > 0 && editorContainerWidth > 0) {
							$$renderer.push(`<!--[0--><div class="mt-4 rounded border border-gray-700 bg-gray-800 p-2 font-mono text-xs">Width: ${$.escape(editorSizes[0].toFixed(2))}% = ${$.escape(getPixels(editorSizes[0], editorContainerWidth))}px</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						SplitPane($$renderer, {
							direction: 'vertical',
							initialSizes: [70, 30],
							responsive: false,
							children: ($$renderer) => {
								Pane($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="h-full overflow-auto bg-gray-800 p-4 font-mono text-sm text-green-400"><div class="mb-2 flex items-center justify-between"><h3 class="font-semibold text-white">script.js</h3> <span class="text-xs text-gray-400">JavaScript</span></div> <pre class="text-xs">function hello() {
  console.log('Hello World');
  return 'Welcome to SplitPane!';
}

hello();</pre></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Pane($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="h-full overflow-auto bg-black p-4 font-mono text-sm text-gray-300"><h3 class="mb-2 font-semibold text-white">Terminal</h3> <div class="space-y-1 text-xs"><p>$ npm run dev</p> <p class="text-green-400">✓ Server running on http://localhost:5173</p> <p class="text-gray-500">Press h to show help</p></div></div>`);
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div>`);
	});
}