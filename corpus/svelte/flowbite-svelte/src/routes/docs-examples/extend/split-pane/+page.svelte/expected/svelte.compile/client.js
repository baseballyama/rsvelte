import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SplitPane, Pane, SidebarGroup, SidebarItem } from "$lib";
import { ChartOutline, GridSolid, MailBoxSolid, UserSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2"> </span> <span class="ml-3"> </span></div>`);
var root_1 = $.from_html(`<div class="mt-4 rounded border bg-white p-2 font-mono text-xs"> </div>`);
var root_2 = $.from_html(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Left Pane</h3> <p>This is the left pane content. Drag the divider to resize!</p> <!></div>`);
var root_3 = $.from_html(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Right Pane</h3> <p>This is the right pane content.</p> <!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pro</span>`);
var root_6 = $.from_html(`<span class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Left Pane</h3> <!></div>`);

var root_9 = $.from_html(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Right Pane</h3> <p>This is the right pane content. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit nulla ipsum inventore nihil labore in velit dolores consequatur, voluptas praesentium
              perferendis nobis sequi culpa laboriosam natus! Dignissimos exercitationem vitae necessitatibus.</p></div>`);

var root_10 = $.from_html(`<div class="h-full bg-purple-50 p-4"><h3 class="font-semibold">Top Pane (30%)</h3> <p>Tab to the divider and use arrow keys (↑/↓) for keyboard control.</p> <!></div>`);
var root_11 = $.from_html(`<div class="h-full bg-yellow-50 p-4"><h3 class="font-semibold">Bottom Pane (70%)</h3> <p>Press Enter or Space on divider to reset to equal sizes.</p> <!></div>`);
var root_12 = $.from_html(`<div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2"> </span> <span class="ml-3"> </span> <span class="ml-3"> </span></div>`);
var root_13 = $.from_html(`<div class="h-full bg-red-50 p-4"><h3 class="font-semibold">Pane 1</h3> <p>First pane</p> <!></div>`);
var root_14 = $.from_html(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Pane 2</h3> <p>Middle pane</p> <!></div>`);
var root_15 = $.from_html(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Pane 3</h3> <p>Last pane</p> <!></div>`);
var root_16 = $.from_html(`<!> <!> <!>`, 1);
var root_17 = $.from_html(`<div class="h-full bg-indigo-50 p-4"><h3 class="font-semibold">Pane A</h3> <p>Resize your browser window to see the layout change from horizontal to vertical at 768px.</p> <!></div>`);
var root_18 = $.from_html(`<div class="h-full bg-pink-50 p-4"><h3 class="font-semibold">Pane B</h3> <p>The onResize callback tracks size changes shown above.</p> <!></div>`);
var root_19 = $.from_html(`<div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> <span class="ml-4"><strong>Outer Sizes:</strong></span> <span class="ml-2"> </span> <span class="ml-3"> </span></div>`);
var root_20 = $.from_html(`<div class="h-full bg-gray-50 p-4"><h3 class="font-semibold">Sidebar</h3> <p>Navigation or tools</p> <!></div>`);
var root_21 = $.from_html(`<div class="h-full bg-blue-50 p-4"><h3 class="font-semibold">Top Content</h3> <p>Main content area</p></div>`);
var root_22 = $.from_html(`<div class="h-full bg-green-50 p-4"><h3 class="font-semibold">Bottom Content</h3> <p>Footer or additional info</p></div>`);
var root_23 = $.from_html(`<div class="mb-2 text-sm text-gray-600"><strong>Container:</strong> <span class="ml-4"><strong>Sizes:</strong></span> <span class="ml-2"> </span> <span class="ml-3"> </span> <span class="ml-4 text-blue-600"><strong>Min:</strong> </span></div>`);
var root_24 = $.from_html(`<div class="h-full bg-orange-50 p-4"><h3 class="font-semibold">Constrained Pane</h3> <p class="mt-2 text-sm">This pane has:</p> <ul class="ml-5 list-disc text-sm"><li>Min size: <strong>300px</strong></li></ul> <!></div>`);
var root_25 = $.from_html(`<div class="h-full bg-teal-50 p-4"><h3 class="font-semibold">Flexible Pane</h3> <p>This pane takes up the remaining space.</p> <!></div>`);
var root_26 = $.from_html(`<div class="mt-4 rounded border border-gray-700 bg-gray-800 p-2 font-mono text-xs"> </div>`);
var root_27 = $.from_html(`<div class="h-full overflow-auto bg-gray-900 p-4 text-white"><h3 class="mb-4 font-semibold">📁 Explorer</h3> <ul class="space-y-1 text-sm"><li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 index.html</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 styles.css</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 script.js</li> <li class="cursor-pointer rounded p-1 hover:bg-gray-800">📄 App.svelte</li></ul> <!></div>`);

var root_28 = $.from_html(`<div class="h-full overflow-auto bg-gray-800 p-4 font-mono text-sm text-green-400"><div class="mb-2 flex items-center justify-between"><h3 class="font-semibold text-white">script.js</h3> <span class="text-xs text-gray-400">JavaScript</span></div> <pre class="text-xs">function hello() &#123;
  console.log('Hello World');
  return 'Welcome to SplitPane!';
&#125;

hello();</pre></div>`);

var root_29 = $.from_html(`<div class="h-full overflow-auto bg-black p-4 font-mono text-sm text-gray-300"><h3 class="mb-2 font-semibold text-white">Terminal</h3> <div class="space-y-1 text-xs"><p>$ npm run dev</p> <p class="text-green-400">✓ Server running on http://localhost:5173</p> <p class="text-gray-500">Press h to show help</p></div></div>`);
var root_30 = $.from_html(`<div class="bg-gray-100"><div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Basic Horizontal Split</h2> <p class="dark:text-white">Simple two-pane horizontal layout with draggable divider. Demonstrates core resizing functionality with visual feedback showing percentage and pixel widths.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Basic Horizontal Split with Sidebar</h2> <p class="dark:text-white">Two-pane horizontal layout with minSize of 200 and initialSizes of [25,75] and Sidebar components on the left pane.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Vertical Split (30/70)</h2> <p class="dark:text-white">Vertical layout with custom initial sizes and keyboard controls. Use arrow keys to adjust, Enter/Space to reset to equal distribution.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Three Panes</h2> <p class="dark:text-white">Multiple panes in single container with individual dividers. Each pane can be resized independently while maintaining minimum size constraints.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Responsive (switches to vertical on mobile)</h2> <p class="dark:text-white">Automatically switches between horizontal and vertical layouts based on viewport width. Features callback tracking for size change monitoring.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Nested Split Panes</h2> <p class="dark:text-white">Complex layout combining horizontal and vertical splits. Creates sidebar with vertically-split main content area for advanced dashboard layouts.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">With Min Constraints (300px minimum)</h2> <p class="dark:text-white">Demonstrates minimum size enforcement. Panes cannot be resized below 300px, preventing content from becoming unusable during aggressive resizing.</p> <!> <div class="h-96 rounded border"><!></div></div> <div class="mb-8 bg-white p-8"><h2 class="mb-4 text-xl font-bold">Code Editor Layout</h2> <p class="dark:text-white">Production-ready IDE-style interface with file explorer, code editor, and terminal. Shows practical implementation with nested panes and dark theme.</p> <!> <div class="h-[600px] overflow-hidden rounded border"><!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let basicSizes = $.state($.proxy([]));
	let basicWithSidebarSizes = $.state($.proxy([]));
	let verticalSizes = $.state($.proxy([]));
	let threePaneSizes = $.state($.proxy([]));
	let responsiveSizes = $.state($.proxy([]));
	let nestedSizes = $.state($.proxy([]));
	let constrainedSizes = $.state($.proxy([]));
	let editorSizes = $.state($.proxy([]));
	let basicContainerWidth = $.state(0);
	let basicWithSidebarWidth = $.state(0);
	let verticalContainerHeight = $.state(0);
	let threePaneContainerWidth = $.state(0);
	let responsiveContainerWidth = $.state(0);
	let nestedContainerWidth = $.state(0);
	let constrainedContainerWidth = $.state(0);
	let editorContainerWidth = $.state(0);
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
		$.set(basicSizes, newSizes, true);
		updateBasicContainerWidth();
	}

	function handleBasicWithSidebarResize(newSizes) {
		$.set(basicWithSidebarSizes, newSizes, true);
		updateBasicWithSidebarWidth();
	}

	function handleVerticalResize(newSizes) {
		$.set(verticalSizes, newSizes, true);
		updateVerticalContainerHeight();
	}

	function handleThreePaneResize(newSizes) {
		$.set(threePaneSizes, newSizes, true);
		updateThreePaneContainerWidth();
	}

	function handleResponsiveResize(newSizes) {
		$.set(responsiveSizes, newSizes, true);
		updateResponsiveContainerWidth();
	}

	function handleNestedResize(newSizes) {
		$.set(nestedSizes, newSizes, true);
		updateNestedContainerWidth();
	}

	function handleConstrainedResize(newSizes) {
		$.set(constrainedSizes, newSizes, true);
		updateConstrainedContainerWidth();
	}

	function handleEditorResize(newSizes) {
		$.set(editorSizes, newSizes, true);
		updateEditorContainerWidth();
	}

	function updateBasicContainerWidth() {
		if (basicContainerElement) {
			$.set(basicContainerWidth, basicContainerElement.offsetWidth, true);
		}
	}

	function updateBasicWithSidebarWidth() {
		if (basicWithSidebarElement) {
			$.set(basicWithSidebarWidth, basicWithSidebarElement.offsetWidth, true);
		}
	}

	function updateVerticalContainerHeight() {
		if (verticalContainerElement) {
			$.set(verticalContainerHeight, verticalContainerElement.offsetHeight, true);
		}
	}

	function updateThreePaneContainerWidth() {
		if (threePaneContainerElement) {
			$.set(threePaneContainerWidth, threePaneContainerElement.offsetWidth, true);
		}
	}

	function updateResponsiveContainerWidth() {
		if (responsiveContainerElement) {
			$.set(responsiveContainerWidth, responsiveContainerElement.offsetWidth, true);
		}
	}

	function updateNestedContainerWidth() {
		if (nestedContainerElement) {
			$.set(nestedContainerWidth, nestedContainerElement.offsetWidth, true);
		}
	}

	function updateConstrainedContainerWidth() {
		if (constrainedContainerElement) {
			$.set(constrainedContainerWidth, constrainedContainerElement.offsetWidth, true);
		}
	}

	function updateEditorContainerWidth() {
		if (editorContainerElement) {
			$.set(editorContainerWidth, editorContainerElement.offsetWidth, true);
		}
	}

	$.user_effect(() => {
		if (basicContainerElement) {
			updateBasicContainerWidth();
			window.addEventListener("resize", updateBasicContainerWidth);

			return () => window.removeEventListener("resize", updateBasicContainerWidth);
		}
	});

	$.user_effect(() => {
		if (basicWithSidebarElement) {
			updateBasicWithSidebarWidth();
			window.addEventListener("resize", updateBasicWithSidebarWidth);

			return () => window.removeEventListener("resize", updateBasicWithSidebarWidth);
		}
	});

	$.user_effect(() => {
		if (verticalContainerElement) {
			updateVerticalContainerHeight();
			window.addEventListener("resize", updateVerticalContainerHeight);

			return () => window.removeEventListener("resize", updateVerticalContainerHeight);
		}
	});

	$.user_effect(() => {
		if (threePaneContainerElement) {
			updateThreePaneContainerWidth();
			window.addEventListener("resize", updateThreePaneContainerWidth);

			return () => window.removeEventListener("resize", updateThreePaneContainerWidth);
		}
	});

	$.user_effect(() => {
		if (responsiveContainerElement) {
			updateResponsiveContainerWidth();
			window.addEventListener("resize", updateResponsiveContainerWidth);

			return () => window.removeEventListener("resize", updateResponsiveContainerWidth);
		}
	});

	$.user_effect(() => {
		if (nestedContainerElement) {
			updateNestedContainerWidth();
			window.addEventListener("resize", updateNestedContainerWidth);

			return () => window.removeEventListener("resize", updateNestedContainerWidth);
		}
	});

	$.user_effect(() => {
		if (constrainedContainerElement) {
			updateConstrainedContainerWidth();
			window.addEventListener("resize", updateConstrainedContainerWidth);

			return () => window.removeEventListener("resize", updateConstrainedContainerWidth);
		}
	});

	$.user_effect(() => {
		if (editorContainerElement) {
			updateEditorContainerWidth();
			window.addEventListener("resize", updateEditorContainerWidth);

			return () => window.removeEventListener("resize", updateEditorContainerWidth);
		}
	});

	function getPixels(percent, containerSize) {
		return Math.round(percent / 100 * containerSize);
	}

	var div = root_30();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 4);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var text = $.sibling($.child(div_2));
			var span = $.sibling(text, 3);
			var text_1 = $.only_child(span);
			var span_1 = $.sibling(span, 2);
			var text_2 = $.only_child(span_1);

			$.reset(div_2);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text, ` ${$.get(basicContainerWidth) ?? ''}px `);
					$.set_text(text_1, `Left: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_2, `Right: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(basicSizes)[0].toFixed(1),
					() => getPixels($.get(basicSizes)[0], $.get(basicContainerWidth)),
					() => $.get(basicSizes)[1].toFixed(1),
					() => getPixels($.get(basicSizes)[1], $.get(basicContainerWidth))
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(basicSizes).length > 0 && $.get(basicContainerWidth) > 0) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node, 2);
	var node_1 = $.child(div_3);

	SplitPane(node_1, {
		responsive: false,
		onResize: handleBasicResize,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_2 = $.first_child(fragment);

			Pane(node_2, {
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_2();
					var node_3 = $.sibling($.child(div_4), 4);

					{
						var consequent_1 = ($$anchor) => {
							var div_5 = root_1();
							var text_3 = $.only_child(div_5);

							$.template_effect(($0, $1) => $.set_text(text_3, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(basicSizes)[0].toFixed(2),
								() => getPixels($.get(basicSizes)[0], $.get(basicContainerWidth))
							]);

							$.append($$anchor, div_5);
						};

						$.if(node_3, ($$render) => {
							if ($.get(basicSizes).length > 0 && $.get(basicContainerWidth) > 0) $$render(consequent_1);
						});
					}

					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Pane(node_4, {
				children: ($$anchor, $$slotProps) => {
					var div_6 = root_3();
					var node_5 = $.sibling($.child(div_6), 4);

					{
						var consequent_2 = ($$anchor) => {
							var div_7 = root_1();
							var text_4 = $.only_child(div_7);

							$.template_effect(($0, $1) => $.set_text(text_4, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(basicSizes)[1].toFixed(2),
								() => getPixels($.get(basicSizes)[1], $.get(basicContainerWidth))
							]);

							$.append($$anchor, div_7);
						};

						$.if(node_5, ($$render) => {
							if ($.get(basicSizes).length > 0 && $.get(basicContainerWidth) > 0) $$render(consequent_2);
						});
					}

					$.reset(div_6);
					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => basicContainerElement = $$value, () => basicContainerElement);
	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var node_6 = $.sibling($.child(div_8), 4);

	{
		var consequent_3 = ($$anchor) => {
			var div_9 = root();
			var text_5 = $.sibling($.child(div_9));
			var span_2 = $.sibling(text_5, 3);
			var text_6 = $.only_child(span_2);
			var span_3 = $.sibling(span_2, 2);
			var text_7 = $.only_child(span_3);

			$.reset(div_9);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_5, ` ${$.get(basicWithSidebarWidth) ?? ''}px `);
					$.set_text(text_6, `Left: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_7, `Right: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(basicWithSidebarSizes)[0].toFixed(1),
					() => getPixels($.get(basicWithSidebarSizes)[0], $.get(basicWithSidebarWidth)),
					() => $.get(basicWithSidebarSizes)[1].toFixed(1),
					() => getPixels($.get(basicWithSidebarSizes)[1], $.get(basicWithSidebarWidth))
				]
			);

			$.append($$anchor, div_9);
		};

		$.if(node_6, ($$render) => {
			if ($.get(basicWithSidebarSizes).length > 0 && $.get(basicWithSidebarWidth) > 0) $$render(consequent_3);
		});
	}

	var div_10 = $.sibling(node_6, 2);
	var node_7 = $.child(div_10);

	SplitPane(node_7, {
		minSize: 200,
		initialSizes: [25, 75],
		responsive: false,
		onResize: handleBasicWithSidebarResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_8 = $.first_child(fragment_1);

			Pane(node_8, {
				children: ($$anchor, $$slotProps) => {
					var div_11 = root_8();
					var node_9 = $.sibling($.child(div_11), 2);

					SidebarGroup(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_7();
							var node_10 = $.first_child(fragment_2);

							{
								const icon = ($$anchor) => {
									ChartOutline($$anchor, {
										class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								SidebarItem(node_10, { label: 'Dashboard', href: '/', icon, $$slots: { icon: true } });
							}

							var node_11 = $.sibling(node_10, 2);

							{
								const icon = ($$anchor) => {
									GridSolid($$anchor, {
										class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								const subtext = ($$anchor) => {
									var span_4 = root_5();

									$.append($$anchor, span_4);
								};

								SidebarItem(node_11, {
									label: 'Kanban',
									spanClass,
									href: '/',
									icon,
									subtext,
									$$slots: { icon: true, subtext: true }
								});
							}

							var node_12 = $.sibling(node_11, 2);

							{
								const icon = ($$anchor) => {
									MailBoxSolid($$anchor, {
										class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								const subtext = ($$anchor) => {
									var span_5 = root_6();

									$.append($$anchor, span_5);
								};

								SidebarItem(node_12, {
									label: 'Inbox',
									spanClass,
									href: '/',
									icon,
									subtext,
									$$slots: { icon: true, subtext: true }
								});
							}

							var node_13 = $.sibling(node_12, 2);

							{
								const icon = ($$anchor) => {
									UserSolid($$anchor, {
										class: 'inline h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								};

								SidebarItem(node_13, {
									label: 'Sidebar',
									href: '/components/sidebar',
									icon,
									$$slots: { icon: true }
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_11);
					$.append($$anchor, div_11);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_8, 2);

			Pane(node_14, {
				children: ($$anchor, $$slotProps) => {
					var div_12 = root_9();

					$.append($$anchor, div_12);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);
	$.bind_this(div_10, ($$value) => basicWithSidebarElement = $$value, () => basicWithSidebarElement);
	$.reset(div_8);

	var div_13 = $.sibling(div_8, 2);
	var node_15 = $.sibling($.child(div_13), 4);

	{
		var consequent_4 = ($$anchor) => {
			var div_14 = root();
			var text_8 = $.sibling($.child(div_14));
			var span_6 = $.sibling(text_8, 3);
			var text_9 = $.only_child(span_6);
			var span_7 = $.sibling(span_6, 2);
			var text_10 = $.only_child(span_7);

			$.reset(div_14);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_8, ` ${$.get(verticalContainerHeight) ?? ''}px `);
					$.set_text(text_9, `Top: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_10, `Bottom: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(verticalSizes)[0].toFixed(1),
					() => getPixels($.get(verticalSizes)[0], $.get(verticalContainerHeight)),
					() => $.get(verticalSizes)[1].toFixed(1),
					() => getPixels($.get(verticalSizes)[1], $.get(verticalContainerHeight))
				]
			);

			$.append($$anchor, div_14);
		};

		$.if(node_15, ($$render) => {
			if ($.get(verticalSizes).length > 0 && $.get(verticalContainerHeight) > 0) $$render(consequent_4);
		});
	}

	var div_15 = $.sibling(node_15, 2);
	var node_16 = $.child(div_15);

	SplitPane(node_16, {
		direction: 'vertical',
		initialSizes: [30, 70],
		minSize: 50,
		responsive: false,
		onResize: handleVerticalResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_4();
			var node_17 = $.first_child(fragment_7);

			Pane(node_17, {
				children: ($$anchor, $$slotProps) => {
					var div_16 = root_10();
					var node_18 = $.sibling($.child(div_16), 4);

					{
						var consequent_5 = ($$anchor) => {
							var div_17 = root_1();
							var text_11 = $.only_child(div_17);

							$.template_effect(($0, $1) => $.set_text(text_11, `Height: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(verticalSizes)[0].toFixed(2),
								() => getPixels($.get(verticalSizes)[0], $.get(verticalContainerHeight))
							]);

							$.append($$anchor, div_17);
						};

						$.if(node_18, ($$render) => {
							if ($.get(verticalSizes).length > 0 && $.get(verticalContainerHeight) > 0) $$render(consequent_5);
						});
					}

					$.reset(div_16);
					$.append($$anchor, div_16);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_17, 2);

			Pane(node_19, {
				children: ($$anchor, $$slotProps) => {
					var div_18 = root_11();
					var node_20 = $.sibling($.child(div_18), 4);

					{
						var consequent_6 = ($$anchor) => {
							var div_19 = root_1();
							var text_12 = $.only_child(div_19);

							$.template_effect(($0, $1) => $.set_text(text_12, `Height: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(verticalSizes)[1].toFixed(2),
								() => getPixels($.get(verticalSizes)[1], $.get(verticalContainerHeight))
							]);

							$.append($$anchor, div_19);
						};

						$.if(node_20, ($$render) => {
							if ($.get(verticalSizes).length > 0 && $.get(verticalContainerHeight) > 0) $$render(consequent_6);
						});
					}

					$.reset(div_18);
					$.append($$anchor, div_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_15);
	$.bind_this(div_15, ($$value) => verticalContainerElement = $$value, () => verticalContainerElement);
	$.reset(div_13);

	var div_20 = $.sibling(div_13, 2);
	var node_21 = $.sibling($.child(div_20), 4);

	{
		var consequent_7 = ($$anchor) => {
			var div_21 = root_12();
			var text_13 = $.sibling($.child(div_21));
			var span_8 = $.sibling(text_13, 3);
			var text_14 = $.only_child(span_8);
			var span_9 = $.sibling(span_8, 2);
			var text_15 = $.only_child(span_9);
			var span_10 = $.sibling(span_9, 2);
			var text_16 = $.only_child(span_10);

			$.reset(div_21);

			$.template_effect(
				($0, $1, $2, $3, $4, $5) => {
					$.set_text(text_13, ` ${$.get(threePaneContainerWidth) ?? ''}px `);
					$.set_text(text_14, `Pane 1: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_15, `Pane 2: ${$2 ?? ''}% (${$3 ?? ''}px)`);
					$.set_text(text_16, `Pane 3: ${$4 ?? ''}% (${$5 ?? ''}px)`);
				},
				[
					() => $.get(threePaneSizes)[0].toFixed(1),
					() => getPixels($.get(threePaneSizes)[0], $.get(threePaneContainerWidth)),
					() => $.get(threePaneSizes)[1].toFixed(1),
					() => getPixels($.get(threePaneSizes)[1], $.get(threePaneContainerWidth)),
					() => $.get(threePaneSizes)[2].toFixed(1),
					() => getPixels($.get(threePaneSizes)[2], $.get(threePaneContainerWidth))
				]
			);

			$.append($$anchor, div_21);
		};

		$.if(node_21, ($$render) => {
			if ($.get(threePaneSizes).length > 0 && $.get(threePaneContainerWidth) > 0) $$render(consequent_7);
		});
	}

	var div_22 = $.sibling(node_21, 2);
	var node_22 = $.child(div_22);

	SplitPane(node_22, {
		minSize: 80,
		responsive: false,
		onResize: handleThreePaneResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_16();
			var node_23 = $.first_child(fragment_8);

			Pane(node_23, {
				children: ($$anchor, $$slotProps) => {
					var div_23 = root_13();
					var node_24 = $.sibling($.child(div_23), 4);

					{
						var consequent_8 = ($$anchor) => {
							var div_24 = root_1();
							var text_17 = $.only_child(div_24);

							$.template_effect(($0, $1) => $.set_text(text_17, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(threePaneSizes)[0].toFixed(2),
								() => getPixels($.get(threePaneSizes)[0], $.get(threePaneContainerWidth))
							]);

							$.append($$anchor, div_24);
						};

						$.if(node_24, ($$render) => {
							if ($.get(threePaneSizes).length > 0 && $.get(threePaneContainerWidth) > 0) $$render(consequent_8);
						});
					}

					$.reset(div_23);
					$.append($$anchor, div_23);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_23, 2);

			Pane(node_25, {
				children: ($$anchor, $$slotProps) => {
					var div_25 = root_14();
					var node_26 = $.sibling($.child(div_25), 4);

					{
						var consequent_9 = ($$anchor) => {
							var div_26 = root_1();
							var text_18 = $.only_child(div_26);

							$.template_effect(($0, $1) => $.set_text(text_18, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(threePaneSizes)[1].toFixed(2),
								() => getPixels($.get(threePaneSizes)[1], $.get(threePaneContainerWidth))
							]);

							$.append($$anchor, div_26);
						};

						$.if(node_26, ($$render) => {
							if ($.get(threePaneSizes).length > 0 && $.get(threePaneContainerWidth) > 0) $$render(consequent_9);
						});
					}

					$.reset(div_25);
					$.append($$anchor, div_25);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_25, 2);

			Pane(node_27, {
				children: ($$anchor, $$slotProps) => {
					var div_27 = root_15();
					var node_28 = $.sibling($.child(div_27), 4);

					{
						var consequent_10 = ($$anchor) => {
							var div_28 = root_1();
							var text_19 = $.only_child(div_28);

							$.template_effect(($0, $1) => $.set_text(text_19, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(threePaneSizes)[2].toFixed(2),
								() => getPixels($.get(threePaneSizes)[2], $.get(threePaneContainerWidth))
							]);

							$.append($$anchor, div_28);
						};

						$.if(node_28, ($$render) => {
							if ($.get(threePaneSizes).length > 0 && $.get(threePaneContainerWidth) > 0) $$render(consequent_10);
						});
					}

					$.reset(div_27);
					$.append($$anchor, div_27);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_22);
	$.bind_this(div_22, ($$value) => threePaneContainerElement = $$value, () => threePaneContainerElement);
	$.reset(div_20);

	var div_29 = $.sibling(div_20, 2);
	var node_29 = $.sibling($.child(div_29), 4);

	{
		var consequent_11 = ($$anchor) => {
			var div_30 = root();
			var text_20 = $.sibling($.child(div_30));
			var span_11 = $.sibling(text_20, 3);
			var text_21 = $.only_child(span_11);
			var span_12 = $.sibling(span_11, 2);
			var text_22 = $.only_child(span_12);

			$.reset(div_30);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_20, ` ${$.get(responsiveContainerWidth) ?? ''}px `);
					$.set_text(text_21, `Pane A: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_22, `Pane B: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(responsiveSizes)[0].toFixed(1),
					() => getPixels($.get(responsiveSizes)[0], $.get(responsiveContainerWidth)),
					() => $.get(responsiveSizes)[1].toFixed(1),
					() => getPixels($.get(responsiveSizes)[1], $.get(responsiveContainerWidth))
				]
			);

			$.append($$anchor, div_30);
		};

		$.if(node_29, ($$render) => {
			if ($.get(responsiveSizes).length > 0 && $.get(responsiveContainerWidth) > 0) $$render(consequent_11);
		});
	}

	var div_31 = $.sibling(node_29, 2);
	var node_30 = $.child(div_31);

	SplitPane(node_30, {
		responsive: true,
		breakpoint: 768,
		onResize: handleResponsiveResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_4();
			var node_31 = $.first_child(fragment_9);

			Pane(node_31, {
				children: ($$anchor, $$slotProps) => {
					var div_32 = root_17();
					var node_32 = $.sibling($.child(div_32), 4);

					{
						var consequent_12 = ($$anchor) => {
							var div_33 = root_1();
							var text_23 = $.only_child(div_33);

							$.template_effect(($0, $1) => $.set_text(text_23, `Size: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(responsiveSizes)[0].toFixed(2),
								() => getPixels($.get(responsiveSizes)[0], $.get(responsiveContainerWidth))
							]);

							$.append($$anchor, div_33);
						};

						$.if(node_32, ($$render) => {
							if ($.get(responsiveSizes).length > 0 && $.get(responsiveContainerWidth) > 0) $$render(consequent_12);
						});
					}

					$.reset(div_32);
					$.append($$anchor, div_32);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_31, 2);

			Pane(node_33, {
				children: ($$anchor, $$slotProps) => {
					var div_34 = root_18();
					var node_34 = $.sibling($.child(div_34), 4);

					{
						var consequent_13 = ($$anchor) => {
							var div_35 = root_1();
							var text_24 = $.only_child(div_35);

							$.template_effect(($0, $1) => $.set_text(text_24, `Size: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(responsiveSizes)[1].toFixed(2),
								() => getPixels($.get(responsiveSizes)[1], $.get(responsiveContainerWidth))
							]);

							$.append($$anchor, div_35);
						};

						$.if(node_34, ($$render) => {
							if ($.get(responsiveSizes).length > 0 && $.get(responsiveContainerWidth) > 0) $$render(consequent_13);
						});
					}

					$.reset(div_34);
					$.append($$anchor, div_34);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_31);
	$.bind_this(div_31, ($$value) => responsiveContainerElement = $$value, () => responsiveContainerElement);
	$.reset(div_29);

	var div_36 = $.sibling(div_29, 2);
	var node_35 = $.sibling($.child(div_36), 4);

	{
		var consequent_14 = ($$anchor) => {
			var div_37 = root_19();
			var text_25 = $.sibling($.child(div_37));
			var span_13 = $.sibling(text_25, 3);
			var text_26 = $.only_child(span_13);
			var span_14 = $.sibling(span_13, 2);
			var text_27 = $.only_child(span_14);

			$.reset(div_37);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_25, ` ${$.get(nestedContainerWidth) ?? ''}px `);
					$.set_text(text_26, `Sidebar: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_27, `Main: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(nestedSizes)[0].toFixed(1),
					() => getPixels($.get(nestedSizes)[0], $.get(nestedContainerWidth)),
					() => $.get(nestedSizes)[1].toFixed(1),
					() => getPixels($.get(nestedSizes)[1], $.get(nestedContainerWidth))
				]
			);

			$.append($$anchor, div_37);
		};

		$.if(node_35, ($$render) => {
			if ($.get(nestedSizes).length > 0 && $.get(nestedContainerWidth) > 0) $$render(consequent_14);
		});
	}

	var div_38 = $.sibling(node_35, 2);
	var node_36 = $.child(div_38);

	SplitPane(node_36, {
		responsive: false,
		onResize: handleNestedResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_4();
			var node_37 = $.first_child(fragment_10);

			Pane(node_37, {
				children: ($$anchor, $$slotProps) => {
					var div_39 = root_20();
					var node_38 = $.sibling($.child(div_39), 4);

					{
						var consequent_15 = ($$anchor) => {
							var div_40 = root_1();
							var text_28 = $.only_child(div_40);

							$.template_effect(($0, $1) => $.set_text(text_28, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(nestedSizes)[0].toFixed(2),
								() => getPixels($.get(nestedSizes)[0], $.get(nestedContainerWidth))
							]);

							$.append($$anchor, div_40);
						};

						$.if(node_38, ($$render) => {
							if ($.get(nestedSizes).length > 0 && $.get(nestedContainerWidth) > 0) $$render(consequent_15);
						});
					}

					$.reset(div_39);
					$.append($$anchor, div_39);
				},
				$$slots: { default: true }
			});

			var node_39 = $.sibling(node_37, 2);

			Pane(node_39, {
				children: ($$anchor, $$slotProps) => {
					SplitPane($$anchor, {
						direction: 'vertical',
						transition: false,
						responsive: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_4();
							var node_40 = $.first_child(fragment_12);

							Pane(node_40, {
								children: ($$anchor, $$slotProps) => {
									var div_41 = root_21();

									$.append($$anchor, div_41);
								},
								$$slots: { default: true }
							});

							var node_41 = $.sibling(node_40, 2);

							Pane(node_41, {
								children: ($$anchor, $$slotProps) => {
									var div_42 = root_22();

									$.append($$anchor, div_42);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_38);
	$.bind_this(div_38, ($$value) => nestedContainerElement = $$value, () => nestedContainerElement);
	$.reset(div_36);

	var div_43 = $.sibling(div_36, 2);
	var node_42 = $.sibling($.child(div_43), 4);

	{
		var consequent_16 = ($$anchor) => {
			var div_44 = root_23();
			var text_29 = $.sibling($.child(div_44));
			var span_15 = $.sibling(text_29, 3);
			var text_30 = $.only_child(span_15);
			var span_16 = $.sibling(span_15, 2);
			var text_31 = $.only_child(span_16);
			var span_17 = $.sibling(span_16, 2);
			var text_32 = $.sibling($.child(span_17));

			$.reset(span_17);
			$.reset(div_44);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					$.set_text(text_29, ` ${$.get(constrainedContainerWidth) ?? ''}px `);
					$.set_text(text_30, `Left: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_31, `Right: ${$2 ?? ''}% (${$3 ?? ''}px)`);
					$.set_text(text_32, ` ${$4 ?? ''}%`);
				},
				[
					() => $.get(constrainedSizes)[0].toFixed(1),
					() => getPixels($.get(constrainedSizes)[0], $.get(constrainedContainerWidth)),
					() => $.get(constrainedSizes)[1].toFixed(1),
					() => getPixels($.get(constrainedSizes)[1], $.get(constrainedContainerWidth)),
					() => (300 / $.get(constrainedContainerWidth) * 100).toFixed(2)
				]
			);

			$.append($$anchor, div_44);
		};

		$.if(node_42, ($$render) => {
			if ($.get(constrainedSizes).length > 0 && $.get(constrainedContainerWidth) > 0) $$render(consequent_16);
		});
	}

	var div_45 = $.sibling(node_42, 2);
	var node_43 = $.child(div_45);

	SplitPane(node_43, {
		minSize: 300,
		initialSizes: [30, 70],
		responsive: false,
		onResize: handleConstrainedResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_4();
			var node_44 = $.first_child(fragment_13);

			Pane(node_44, {
				children: ($$anchor, $$slotProps) => {
					var div_46 = root_24();
					var node_45 = $.sibling($.child(div_46), 6);

					{
						var consequent_17 = ($$anchor) => {
							var div_47 = root_1();
							var text_33 = $.only_child(div_47);

							$.template_effect(($0, $1) => $.set_text(text_33, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(constrainedSizes)[0].toFixed(2),
								() => getPixels($.get(constrainedSizes)[0], $.get(constrainedContainerWidth))
							]);

							$.append($$anchor, div_47);
						};

						$.if(node_45, ($$render) => {
							if ($.get(constrainedSizes).length > 0 && $.get(constrainedContainerWidth) > 0) $$render(consequent_17);
						});
					}

					$.reset(div_46);
					$.append($$anchor, div_46);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_44, 2);

			Pane(node_46, {
				children: ($$anchor, $$slotProps) => {
					var div_48 = root_25();
					var node_47 = $.sibling($.child(div_48), 4);

					{
						var consequent_18 = ($$anchor) => {
							var div_49 = root_1();
							var text_34 = $.only_child(div_49);

							$.template_effect(($0, $1) => $.set_text(text_34, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(constrainedSizes)[1].toFixed(2),
								() => getPixels($.get(constrainedSizes)[1], $.get(constrainedContainerWidth))
							]);

							$.append($$anchor, div_49);
						};

						$.if(node_47, ($$render) => {
							if ($.get(constrainedSizes).length > 0 && $.get(constrainedContainerWidth) > 0) $$render(consequent_18);
						});
					}

					$.reset(div_48);
					$.append($$anchor, div_48);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	$.reset(div_45);
	$.bind_this(div_45, ($$value) => constrainedContainerElement = $$value, () => constrainedContainerElement);
	$.reset(div_43);

	var div_50 = $.sibling(div_43, 2);
	var node_48 = $.sibling($.child(div_50), 4);

	{
		var consequent_19 = ($$anchor) => {
			var div_51 = root();
			var text_35 = $.sibling($.child(div_51));
			var span_18 = $.sibling(text_35, 3);
			var text_36 = $.only_child(span_18);
			var span_19 = $.sibling(span_18, 2);
			var text_37 = $.only_child(span_19);

			$.reset(div_51);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_35, ` ${$.get(editorContainerWidth) ?? ''}px `);
					$.set_text(text_36, `Explorer: ${$0 ?? ''}% (${$1 ?? ''}px)`);
					$.set_text(text_37, `Editor: ${$2 ?? ''}% (${$3 ?? ''}px)`);
				},
				[
					() => $.get(editorSizes)[0].toFixed(1),
					() => getPixels($.get(editorSizes)[0], $.get(editorContainerWidth)),
					() => $.get(editorSizes)[1].toFixed(1),
					() => getPixels($.get(editorSizes)[1], $.get(editorContainerWidth))
				]
			);

			$.append($$anchor, div_51);
		};

		$.if(node_48, ($$render) => {
			if ($.get(editorSizes).length > 0 && $.get(editorContainerWidth) > 0) $$render(consequent_19);
		});
	}

	var div_52 = $.sibling(node_48, 2);
	var node_49 = $.child(div_52);

	SplitPane(node_49, {
		initialSizes: [20, 80],
		minSize: 150,
		responsive: false,
		onResize: handleEditorResize,
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_4();
			var node_50 = $.first_child(fragment_14);

			Pane(node_50, {
				children: ($$anchor, $$slotProps) => {
					var div_53 = root_27();
					var node_51 = $.sibling($.child(div_53), 4);

					{
						var consequent_20 = ($$anchor) => {
							var div_54 = root_26();
							var text_38 = $.only_child(div_54);

							$.template_effect(($0, $1) => $.set_text(text_38, `Width: ${$0 ?? ''}% = ${$1 ?? ''}px`), [
								() => $.get(editorSizes)[0].toFixed(2),
								() => getPixels($.get(editorSizes)[0], $.get(editorContainerWidth))
							]);

							$.append($$anchor, div_54);
						};

						$.if(node_51, ($$render) => {
							if ($.get(editorSizes).length > 0 && $.get(editorContainerWidth) > 0) $$render(consequent_20);
						});
					}

					$.reset(div_53);
					$.append($$anchor, div_53);
				},
				$$slots: { default: true }
			});

			var node_52 = $.sibling(node_50, 2);

			Pane(node_52, {
				children: ($$anchor, $$slotProps) => {
					SplitPane($$anchor, {
						direction: 'vertical',
						initialSizes: [70, 30],
						responsive: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_4();
							var node_53 = $.first_child(fragment_16);

							Pane(node_53, {
								children: ($$anchor, $$slotProps) => {
									var div_55 = root_28();

									$.append($$anchor, div_55);
								},
								$$slots: { default: true }
							});

							var node_54 = $.sibling(node_53, 2);

							Pane(node_54, {
								children: ($$anchor, $$slotProps) => {
									var div_56 = root_29();

									$.append($$anchor, div_56);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_52);
	$.bind_this(div_52, ($$value) => editorContainerElement = $$value, () => editorContainerElement);
	$.reset(div_50);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}