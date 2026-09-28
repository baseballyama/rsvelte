import 'svelte/internal/disclose-version';
import { WebContainer } from '@webcontainer/api';
import { PaneGroup, Pane, PaneResizer } from 'paneforge';
import { Icon, Button, Tooltip } from 'svelte-ux';
import { slide } from 'svelte/transition';
import FileTree from './FileTree/FileTree.svelte';
import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';
import SimpleIconsTerminal from '~icons/simple-icons/windowsterminal';
import SimpleIconsSvelte from '~icons/simple-icons/svelte';
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
import VscodeIconsFileTypeJavascript from '~icons/vscode-icons/file-type-js';
import VscodeIconsFileTypeCss from '~icons/vscode-icons/file-type-css';
import RefreshCcwIcon from '~icons/lucide/refresh-ccw';
import ChevronDown from '~icons/lucide/chevron-down';
import ChevronUp from '~icons/lucide/chevron-up';
import TrashIcon from '~icons/lucide/trash';
import Download from '~icons/lucide/download';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import CodeEditor from './CodeEditor.svelte';
import { Overlay, ProgressCircle } from 'svelte-ux';
import { AnsiUp } from 'ansi_up';

const WEBCONTAINER_KEY = '__webcontainer_instance__';
var root = $.from_html(`<div class="absolute left-0 right-0 top-full z-10 bg-surface-100 border-t border-surface-content/10 shadow-lg"><!></div>`);
var root_1 = $.from_html(`<span class="flex items-center gap-2 flex-1 text-left"><!> </span> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-center h-full"><div class="text-surface-content/50">Loading...</div></div>`);
var root_3 = $.from_html(`<div class="flex flex-col h-full border-r border-surface-content/10"><div class="relative flex items-center gap-4 p-2 border-b border-surface-content/10 bg-transparent"><div class="flex-1"><!> <!></div> <!> <!> <!></div> <div class="flex-1 overflow-hidden"><!></div></div>`);
var root_4 = $.from_html(`<!> <div class="text-lg font-medium"> </div>`, 1);
var root_5 = $.from_html(`<button class="absolute top-2 right-2"><!></button>`);
var root_6 = $.from_html(`<div class="relative h-full bg-surface-100 pt-[47px]"><!> <iframe title="LayerChart Playground" class="w-full h-[calc(100%-20px)]" allowfullscreen=""></iframe></div>`);
var root_7 = $.from_html(`<div role="button" tabindex="-1" class="h-full flex justify-between items-center bg-surface-300/30 px-1 cursor-pointer group/header select-none"><div class="flex items-center gap-2 text-sm font-mono"><!> <span class="group-hover/header:underline group-hover/header:decoration-current/50">Console</span></div> <button type="button" class="text-xs font-mono relative py-1 px-2 outline outline-primary/10 rounded-sm flex items-center gap-2">Clear <!></button></div>`);
var root_8 = $.from_html(`<div class="h-full flex flex-col"><div class="flex-1 overflow-auto text-xs font-mono p-1 whitespace-pre-wrap bg-surface-100/50"></div></div>`);
var root_9 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`<!> <!> <!>`, 1);
var root_11 = $.from_html(`<div class="h-[calc(100vh-64px)] flex bg-surface-100"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/* TODO:
	- incase you didn't see it you can click console to expand/collapse.
	- second pass background colors, etc. I'm always open for revisions.
	- console output seems to missing some later stage loading state - "load preview..."
	- filter blank \n going to console output?
	- collapse console when loaded is working, but performing too early.
	- Refresh correct, or something thru webcontainer?
	- Buttons from Svelte-UX w/Icons - icons not centered vertically.
	- Code - Open Project in StackBlitz
	- Code - Open Project in Svelte REPL
	- Code - Download Project
	*/
	const ansiUp = new AnsiUp();

	// Container, Pane, and Elements state
	let webcontainerInstance = $.state(null);

	let iframeEl = $.state(null);
	let fileSelectorEl = $.state(null);
	let previewPaneGroup = $.state(void 0); // Preview and Console Pane Groups
	let consolePane = $.state(void 0);
	let consoleOutput = $.state('Provisioning...\n\n');
	let consoleScrollContainer = $.state(void 0);
	let isConsoleScrollAtBottom = $.state(true);
	let fileTreeShowing = $.state(false);

	// File editing state
	let selectedFile = $.state('src/routes/+page.svelte');

	let fileContent = $.state('');
	let editableFiles = $.state($.proxy([]));
	let isLoadingFile = $.state(false);

	// Loading state
	let loadingStatus = $.state('Initializing WebContainer...');

	let isReady = $.state(false);
	let viteConnected = $.state(false);
	let viteTimeoutId = null;

	function isScrolledToBottom() {
		if (!$.get(consoleScrollContainer)) return false;

		const threshold = 5; // pixels threshold to account for rounding

		return $.get(consoleScrollContainer).scrollHeight - $.get(consoleScrollContainer).scrollTop <= $.get(consoleScrollContainer).clientHeight + threshold;
	}

	// Track scroll position changes to know if user has manually scrolled
	function handleConsoleScroll() {
		$.set(isConsoleScrollAtBottom, isScrolledToBottom(), true);
	}

	async function scrollConsoleToBottom() {
		await tick();

		$.get(consoleScrollContainer)?.scrollTo({
			top: $.get(consoleScrollContainer).scrollHeight,
			behavior: 'instant'
		});
	}

	// Auto-scroll console when output changes, only if we were at the bottom
	$.user_effect(() => {
		if ($.get(consoleOutput) && $.get(consolePane) && !$.get(consolePane).isCollapsed() && $.get(isConsoleScrollAtBottom)) {
			scrollConsoleToBottom();
		}
	});

	let fileIcon = $.derived(() => {
		if ($.get(selectedFile).endsWith('.svelte')) {
			return VscodeIconsFileTypeSvelte;
		} else if ($.get(selectedFile).endsWith('.ts')) {
			return VscodeIconsFileTypeTypescript;
		} else if ($.get(selectedFile).endsWith('.js')) {
			return VscodeIconsFileTypeJavascript;
		} else if ($.get(selectedFile).endsWith('.css')) {
			return VscodeIconsFileTypeCss;
		}
	});

	async function getWebContainerInstance() {
		if (typeof window !== 'undefined') {
			if (!window[WEBCONTAINER_KEY]) {
				window[WEBCONTAINER_KEY] = WebContainer.boot();
			}

			return window[WEBCONTAINER_KEY];
		}

		throw new Error('WebContainer can only be initialized in browser');
	}

	// Get list of editable files from the template
	function getEditableFiles() {
		const files = [];

		function traverse(obj, prefix = '') {
			for (const [key, value] of Object.entries(obj)) {
				if (value && typeof value === 'object') {
					if ('file' in value) {
						files.push(prefix + key);
					} else if ('directory' in value) {
						traverse(value.directory, prefix + key + '/');
					}
				}
			}
		}

		traverse($$props.data.templateProjectFiles);

		return files.filter((f) => f.endsWith('.svelte') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.css'));
	}

	// Load file content
	async function loadFileContent(filepath) {
		if (!$.get(webcontainerInstance)) return;

		$.set(isLoadingFile, true);

		try {
			const content = await $.get(webcontainerInstance).fs.readFile(filepath, 'utf-8');

			$.set(fileContent, content, true);
		} catch(err) {
			console.error('Failed to read file:', err);
			$.set(fileContent, '// Error loading file');
		} finally {
			$.set(isLoadingFile, false);
		}
	}

	// Save selected file content
	async function saveFileContent() {
		if (!$.get(webcontainerInstance) || !$.get(selectedFile)) return;

		try {
			await $.get(webcontainerInstance).fs.writeFile($.get(selectedFile), $.get(fileContent));
		} catch(err) {
			console.error('Failed to save file:', err);
		}
	}

	// Handle file selection change
	async function handleFileSelect(filepath) {
		$.set(selectedFile, filepath, true);
		await loadFileContent(filepath);
	}

	// Save Project Locally
	async function saveProject() {
		// This needs wired up
	}

	// Open Project in StackBlitz
	async function openInStackBlitz() {
		// This needs wired up
	}

	// Open Project in REPL
	async function openInREPL() {
		// This needs wired up
	}

	onMount(async () => {
		try {
			$.set(loadingStatus, 'Booting WebContainer...');
			$.set(webcontainerInstance, await getWebContainerInstance(), true);

			if (!$.get(webcontainerInstance)) {
				throw new Error('Failed to boot WebContainer');
			}

			$.set(loadingStatus, 'Mounting project files...');
			await $.get(webcontainerInstance).mount($$props.data.templateProjectFiles);

			// Get editable files list
			$.set(editableFiles, getEditableFiles(), true);

			$.set(loadingStatus, 'Loading editor...');
			await loadFileContent($.get(selectedFile));

			// Listen for messages from the iframe to detect Vite connection and console logs
			const handleMessage = (event) => {
				// Only process messages from our iframe
				if (event.source !== $.get(iframeEl)?.contentWindow) return;

				// Check if message is from Vite client
				if (event.data && typeof event.data === 'object') {
					const data = event.data;

					// Handle console logs from iframe
					if (data.type === 'console') {
						const logType = data.level || 'log';
						const args = data.args || [];

						const logText = args.map((arg) => {
							if (typeof arg === 'object') {
								return JSON.stringify(arg, null, 2);
							}

							return String(arg);
						}).join(' ');

						const colorMap = {
							log: '#e5e7eb',
							warn: '#fbbf24',
							error: '#ef4444',
							info: '#3b82f6'
						};

						const color = colorMap[logType] || colorMap.log;

						$.set(consoleOutput, $.get(consoleOutput) + `<span style="color: ${color}">[${logType}] ${logText}</span>\n`);
					}

					// Vite HMR sends various message types - we'll clear loading on any HMR activity
					if (data.type && (data.type.includes('vite') || data.type === 'connected')) {
						if (!$.get(viteConnected)) {
							$.set(viteConnected, true);

							if (viteTimeoutId) {
								clearTimeout(viteTimeoutId);
								viteTimeoutId = null;
							}

							$.set(loadingStatus, null);
							$.set(isReady, true);
						}
					}
				}
			};

			window.addEventListener('message', handleMessage);

			$.get(webcontainerInstance).on('server-ready', (port, url) => {
				if ($.get(iframeEl)) {
					$.set(loadingStatus, 'Loading preview...');
					$.get(iframeEl).src = url;
				}
			});

			await startDevServer();
		} catch(error) {
			$.set(loadingStatus, 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	});

	async function startDevServer() {
		if (!$.get(webcontainerInstance)) {
			throw new Error('WebContainer instance not initialized');
		}

		// Install dependencies
		$.set(loadingStatus, 'Installing dependencies...');

		const installProcess = await $.get(webcontainerInstance).spawn('pnpm', ['install']);

		// Capture install output
		installProcess.output.pipeTo(new WritableStream({
			write(data) {
				const text = data.toString();

				console.log('[WebContainer install]:', text);
				$.set(consoleOutput, $.get(consoleOutput) + ansiUp.ansi_to_html(text));
			}
		}));

		const installExitCode = await installProcess.exit;

		if (installExitCode !== 0) {
			throw new Error('Unable to run pnpm install');
		}

		// Start dev server
		$.set(loadingStatus, 'Starting dev server...');

		const devProcess = await $.get(webcontainerInstance).spawn('pnpm', ['run', 'dev']);

		// Listen to output to detect when Vite is building
		devProcess.output.pipeTo(new WritableStream({
			write(data) {
				const text = data.toString();

				// Skip large amount of blank lines
				if (text === '\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n') {
					return;
				}

				console.log('[WebContainer]:', text);

				// Append to console output (converting ANSI codes to HTML)
				$.set(consoleOutput, $.get(consoleOutput) + ansiUp.ansi_to_html(text));

				// Update status based on Vite output
				if (text.includes('VITE') && text.includes('ready')) {
					$.set(loadingStatus, 'Ready! Loading preview...');

					// TODO: Consider reeanbling auto-hiding once the timing is better
					// consolePane?.collapse();
				} else if (text.includes('build started') || text.includes('building')) {
					$.set(loadingStatus, 'Building application...');
				}
			}
		}));
	}

	function toggleConsole() {
		if ($.get(consolePane)?.isCollapsed()) {
			$.get(consolePane).expand();
		} else {
			$.get(consolePane)?.collapse();
		}
	}

	// Handle click outside of file tree to close it
	function handleClickOutside(event) {
		// Don't close if clicking on SVG icons (folder toggles)
		const target = event.target;

		if (target instanceof SVGElement) return;

		if ($.get(fileTreeShowing) && $.get(fileSelectorEl) && !$.get(fileSelectorEl).contains(event.target)) {
			$.set(fileTreeShowing, false);
		}
	}

	var div = root_11();

	$.event('click', $.window, handleClickOutside);

	var node = $.child(div);

	PaneGroup(node, {
		direction: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_10();
			var node_1 = $.first_child(fragment);

			Pane(node_1, {
				defaultSize: 50,
				minSize: 5,
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_3();
					var div_2 = $.child(div_1);
					var div_3 = $.child(div_2);
					var node_2 = $.child(div_3);

					{
						var consequent = ($$anchor) => {
							var div_4 = root();
							var node_3 = $.child(div_4);

							FileTree(node_3, {
								class: 'w-full py-2 pl-4 pr-2 bg-surface-100 overlow-x-clip overflow-y-auto',
								get filePaths() {
									return $.get(editableFiles);
								},

								get selectedFile() {
									return $.get(selectedFile);
								},

								onSelect: (path) => {
									handleFileSelect(path);
									$.set(fileTreeShowing, false);
								}
							});

							$.reset(div_4);
							$.transition(3, div_4, () => slide, () => ({ duration: 200 }));
							$.append($$anchor, div_4);
						};

						$.if(node_2, ($$render) => {
							if ($.get(fileTreeShowing)) $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_2, 2);

					Button(node_4, {
						class: 'border py-1 px-2 w-full justify-between bg-surface-100',
						$$events: { click: () => $.set(fileTreeShowing, !$.get(fileTreeShowing)) },
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var span = $.first_child(fragment_1);
							var node_5 = $.child(span);

							Icon(node_5, {
								get data() {
									return $.get(fileIcon);
								}
							});

							var text_1 = $.sibling(node_5);

							$.reset(span);

							var node_6 = $.sibling(span, 2);

							$.key(node_6, () => $.get(fileTreeShowing), ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(fileTreeShowing) ? ChevronUp : ChevronDown);

									Icon($$anchor, {
										get data() {
											return $.get($0);
										},
										class: 'text-surface-content/50'
									});
								}
							});

							$.template_effect(() => $.set_text(text_1, ` ${$.get(selectedFile) ?? ''}`));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.bind_this(div_3, ($$value) => $.set(fileSelectorEl, $$value), () => $.get(fileSelectorEl));

					var node_7 = $.sibling(div_3, 2);

					Tooltip(node_7, {
						title: 'Open in StackBlitz',
						placement: 'top',
						offset: 6,
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(openInStackBlitz);

								Button($$anchor, {
									href: 'https://stackblitz.com',
									get icon() {
										return SimpleIconsStackblitz;
									},
									size: 'sm',
									variant: 'fill-light',
									target: '_blank',
									get onclick() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Tooltip(node_8, {
						title: 'Open in REPL',
						placement: 'top',
						offset: 6,
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(openInREPL);

								Button($$anchor, {
									href: 'https://svelte.dev/playground',
									get icon() {
										return SimpleIconsSvelte;
									},
									size: 'sm',
									variant: 'fill-light',
									target: '_blank',
									get onclick() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Tooltip(node_9, {
						title: 'Download',
						placement: 'top',
						offset: 6,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return Download;
								},
								size: 'sm',
								variant: 'fill-light',
								target: '_blank',
								onclick: saveProject
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var div_5 = $.sibling(div_2, 2);
					var node_10 = $.child(div_5);

					{
						var consequent_1 = ($$anchor) => {
							var div_6 = root_2();

							$.append($$anchor, div_6);
						};

						var alternate = ($$anchor) => {
							CodeEditor($$anchor, {
								get filename() {
									return $.get(selectedFile);
								},
								oninput: saveFileContent,
								get value() {
									return $.get(fileContent);
								},

								set value($$value) {
									$.set(fileContent, $$value, true);
								}
							});
						};

						$.if(node_10, ($$render) => {
							if ($.get(isLoadingFile)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(div_5);
					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_1, 2);

			PaneResizer(node_11, { class: 'w-0.5 bg-surface-content/10' });

			var node_12 = $.sibling(node_11, 2);

			Pane(node_12, {
				defaultSize: 50,
				minSize: 5,
				children: ($$anchor, $$slotProps) => {
					$.bind_this(
						PaneGroup($$anchor, {
							direction: 'vertical',
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_9();
								var node_13 = $.first_child(fragment_8);

								Pane(node_13, {
									defaultSize: 70,
									children: ($$anchor, $$slotProps) => {
										var div_7 = root_6();
										var node_14 = $.child(div_7);

										{
											var consequent_2 = ($$anchor) => {
												Overlay($$anchor, {
													class: 'flex flex-col gap-4 bg-surface-100/50',
													center: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_4();
														var node_15 = $.first_child(fragment_10);

														ProgressCircle(node_15, { width: 2 });

														var div_8 = $.sibling(node_15, 2);
														var text_2 = $.only_child(div_8, true);

														$.template_effect(() => $.set_text(text_2, $.get(loadingStatus)));
														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											};

											var alternate_1 = ($$anchor) => {
												var button = root_5();
												var node_16 = $.child(button);

												Tooltip(node_16, {
													title: 'Reload',
													children: ($$anchor, $$slotProps) => {
														Button($$anchor, {
															get icon() {
																return RefreshCcwIcon;
															},
															size: 'sm',
															variant: 'fill-light',
															target: '_blank'
														});
													},
													$$slots: { default: true }
												});

												$.reset(button);

												$.delegated('click', button, async () => {
													// await startDevServer();
													window.location.reload();
												});

												$.append($$anchor, button);
											};

											$.if(node_14, ($$render) => {
												if ($.get(loadingStatus)) $$render(consequent_2); else $$render(alternate_1, -1);
											});
										}

										var iframe = $.sibling(node_14, 2);

										$.bind_this(iframe, ($$value) => $.set(iframeEl, $$value), () => $.get(iframeEl));
										$.reset(div_7);

										$.event('load', iframe, () => {
											// Wait for Vite to connect before clearing loading status
											if ($.get(iframeEl)?.src && !$.get(viteConnected)) {
												$.set(loadingStatus, 'Connecting to Vite...');

												// Fallback: clear after 3 seconds if Vite doesn't connect
												viteTimeoutId = window.setTimeout(
													() => {
														if ($.get(loadingStatus) === 'Connecting to Vite...') {
															$.set(loadingStatus, null);
															$.set(isReady, true);
															$.set(viteConnected, true);
														}
													},
													3000
												);
											} else if ($.get(viteConnected)) {
												$.set(loadingStatus, null);
												$.set(isReady, true);
											}
										});

										$.replay_events(iframe);
										$.append($$anchor, div_7);
									},
									$$slots: { default: true }
								});

								var node_17 = $.sibling(node_13, 2);

								PaneResizer(node_17, { class: 'h-0.5 bg-surface-content/10' });

								var node_18 = $.sibling(node_17, 2);

								Pane(node_18, {
									defaultSize: 5,
									minSize: 0,
									maxSize: 100,
									class: '!flex-none !h-8',
									children: ($$anchor, $$slotProps) => {
										var div_9 = root_7();
										var div_10 = $.child(div_9);
										var node_19 = $.child(div_10);

										Icon(node_19, {
											get data() {
												return SimpleIconsTerminal;
											},
											class: 'text-surface-content/50'
										});

										$.next(2);
										$.reset(div_10);

										var button_1 = $.sibling(div_10, 2);
										var node_20 = $.sibling($.child(button_1));

										Icon(node_20, {
											get data() {
												return TrashIcon;
											},
											class: 'text-surface-content/50'
										});

										$.reset(button_1);
										$.reset(div_9);
										$.delegated('click', div_9, toggleConsole);

										$.delegated('keydown', div_9, (e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												toggleConsole();
											}
										});

										$.delegated('click', button_1, (e) => {
											e.stopPropagation();
											$.set(consoleOutput, '');
										});

										$.append($$anchor, div_9);
									},
									$$slots: { default: true }
								});

								var node_21 = $.sibling(node_18, 2);

								$.bind_this(
									Pane(node_21, {
										defaultSize: 25,
										collapsedSize: 0,
										minSize: 0,
										maxSize: 65,
										collapsible: true,
										class: '[transition:flex-grow_200ms_ease-out]',
										children: ($$anchor, $$slotProps) => {
											var div_11 = root_8();
											var div_12 = $.child(div_11);

											$.html(div_12, () => $.get(consoleOutput), true);
											$.reset(div_12);
											$.bind_this(div_12, ($$value) => $.set(consoleScrollContainer, $$value), () => $.get(consoleScrollContainer));
											$.reset(div_11);
											$.event('scroll', div_12, handleConsoleScroll);
											$.append($$anchor, div_11);
										},
										$$slots: { default: true }
									}),
									($$value) => $.set(consolePane, $$value, true),
									() => $.get(consolePane)
								);

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						}),
						($$value) => $.set(previewPaneGroup, $$value, true),
						() => $.get(previewPaneGroup)
					);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);