import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sidecarService } from '$lib/sidecar.svelte';
import { uiStore } from '$lib/ui.svelte';
import SettingsView from '$lib/components/SettingsView.svelte';
import { listen } from '@tauri-apps/api/event';
import { onMount } from 'svelte';
import CommandPalette from '$lib/components/command-palette/CommandPalette.svelte';
import PluginRunner from '$lib/components/PluginRunner.svelte';
import Extensions from '$lib/components/Extensions.svelte';
import OAuthView from '$lib/components/OAuthView.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import ClipboardHistoryView from '$lib/components/ClipboardHistoryView.svelte';
import QuicklinkForm from '$lib/components/QuicklinkForm.svelte';
import { viewManager } from '$lib/viewManager.svelte';
import SnippetForm from '$lib/components/SnippetForm.svelte';
import ImportSnippets from '$lib/components/ImportSnippets.svelte';
import SearchSnippets from '$lib/components/SearchSnippets.svelte';
import FileSearchView from '$lib/components/FileSearchView.svelte';
import { getCurrentWindow } from '@tauri-apps/api/window';
import CommandDeeplinkConfirm from '$lib/components/CommandDeeplinkConfirm.svelte';
import clipboardHistoryCommandIcon from '$lib/assets/command-clipboard-history-1616x16@2x.png?inline';
import fileSearchCommandIcon from '$lib/assets/command-file-search-1616x16@2x.png?inline';
import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';
import storeCommandIcon from '$lib/assets/command-store-1616x16@2x.png?inline';
import quicklinkIcon from '$lib/assets/quicklinks-package-1616x16@2x.png?inline';
import { invoke } from '@tauri-apps/api/core';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const storePlugin = {
		title: 'Store',
		description: 'Browse and install new extensions from the Store',
		pluginTitle: 'Raycast',
		pluginName: 'raycast',
		commandName: 'store',
		pluginPath: 'builtin:store',
		icon: storeCommandIcon,
		preferences: [],
		mode: 'view',
		owner: 'raycast'
	};

	const clipboardHistoryPlugin = {
		title: 'Clipboard History',
		description: 'View, search, and manage your clipboard history',
		pluginTitle: 'Flare',
		pluginName: 'clipboard-history',
		commandName: 'clipboard-history',
		pluginPath: 'builtin:history',
		icon: clipboardHistoryCommandIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const searchSnippetsPlugin = {
		title: 'Search Snippets',
		description: 'Search and manage your snippets',
		pluginTitle: 'Snippets',
		pluginName: 'snippets',
		commandName: 'search-snippets',
		pluginPath: 'builtin:search-snippets',
		icon: snippetIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const createQuicklinkPlugin = {
		title: 'Create Quicklink',
		description: 'Create a new Quicklink',
		pluginTitle: 'Flare',
		pluginName: 'flare',
		commandName: 'create-quicklink',
		pluginPath: 'builtin:create-quicklink',
		icon: quicklinkIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const createSnippetPlugin = {
		title: 'Create Snippet',
		description: 'Create a new snippet',
		pluginTitle: 'Flare',
		pluginName: 'snippets',
		commandName: 'create-snippet',
		pluginPath: 'builtin:create-snippet',
		icon: snippetIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const importSnippetsPlugin = {
		title: 'Import Snippets',
		description: 'Import snippets from a JSON file',
		pluginTitle: 'Flare',
		pluginName: 'snippets',
		commandName: 'import-snippets',
		pluginPath: 'builtin:import-snippets',
		icon: snippetIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const fileSearchPlugin = {
		title: 'Search Files',
		description: 'Find files and folders on your computer',
		pluginTitle: 'Flare',
		pluginName: 'file-search',
		commandName: 'search-files',
		pluginPath: 'builtin:file-search',
		icon: fileSearchCommandIcon,
		preferences: [],
		mode: 'view',
		owner: 'flare'
	};

	const pluginList = $.derived(() => uiStore.pluginList),
		currentPreferences = $.derived(() => uiStore.currentPreferences);

	const allPlugins = $.derived(() => [
		...$.get(pluginList),
		storePlugin,
		clipboardHistoryPlugin,
		searchSnippetsPlugin,
		createQuicklinkPlugin,
		createSnippetPlugin,
		importSnippetsPlugin,
		fileSearchPlugin
	]);

	const currentView = $.derived(() => viewManager.currentView),
		oauthState = $.derived(() => viewManager.oauthState),
		oauthStatus = $.derived(() => viewManager.oauthStatus),
		quicklinkToEdit = $.derived(() => viewManager.quicklinkToEdit),
		snippetsForImport = $.derived(() => viewManager.snippetsForImport),
		commandToConfirm = $.derived(() => viewManager.commandToConfirm);

	onMount(() => {
		sidecarService.setOnGoBackToPluginList(viewManager.showCommandPalette);
		sidecarService.start();

		invoke('get_discovered_plugins').then((plugins) => {
			uiStore.setPluginList(plugins);
		}).catch((e) => {
			console.error('Failed to discover plugins:', e);
		});

		const unlisten = listen('deep-link', (event) => {
			console.log('Received deep link:', event.payload);
			viewManager.handleDeepLink(event.payload, $.get(allPlugins));
		});

		return () => {
			sidecarService.stop();
			unlisten.then((fn) => fn());
		};
	});

	$.user_effect(() => {
		viewManager.oauthState = sidecarService.oauthState;
	});

	$.user_effect(() => {
		if ($.get(oauthStatus) === 'authorizing' && $.get(oauthState)?.url) {
			openUrl($.get(oauthState).url);
		}
	});

	function handleKeydown(event) {
		if ($.get(currentView) === 'command-palette' && event.key === ',' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			viewManager.showSettings();

			return;
		}

		if (event.key === 'Escape') {
			if ($.get(currentView) === 'command-palette' && !event.defaultPrevented) {
				event.preventDefault();
				getCurrentWindow().hide();
			}
		}
	}

	function handleSavePreferences(pluginName, values) {
		sidecarService.setPreferences(pluginName, values);
	}

	function handleGetPreferences(pluginName) {
		sidecarService.getPreferences(pluginName);
	}

	function handlePopView() {
		sidecarService.dispatchEvent('pop-view');
	}

	function handleToastAction(toastId, actionType) {
		sidecarService.dispatchEvent('dispatch-toast-action', { toastId, actionType });
	}

	function onExtensionInstalled() {
		invoke('get_discovered_plugins').then((plugins) => {
			uiStore.setPluginList(plugins);
		}).catch((e) => {
			console.error('Failed to discover plugins:', e);
		});
	}

	var fragment = root();

	$.event('keydown', $.window, handleKeydown);

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			CommandDeeplinkConfirm($$anchor, {
				get plugin() {
					return $.get(commandToConfirm);
				},

				get onconfirm() {
					return viewManager.confirmRunCommand;
				},

				get oncancel() {
					return viewManager.cancelRunCommand;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(commandToConfirm)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			OAuthView($$anchor, {
				get providerName() {
					return $.get(oauthState).providerName;
				},

				get providerIcon() {
					return $.get(oauthState).providerIcon;
				},

				get description() {
					return $.get(oauthState).description;
				},

				get authUrl() {
					return $.get(oauthState).url;
				},

				get status() {
					return $.get(oauthStatus);
				},

				get onSignIn() {
					return viewManager.handleOauthSignIn;
				},
				onBack: () => sidecarService.oauthState = null
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(oauthState)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			CommandPalette($$anchor, {
				get plugins() {
					return $.get(allPlugins);
				},

				get onRunPlugin() {
					return viewManager.runPlugin;
				}
			});
		};

		var consequent_3 = ($$anchor) => {
			SettingsView($$anchor, {
				get plugins() {
					return $.get(pluginList);
				},

				get onBack() {
					return viewManager.showCommandPalette;
				},
				onSavePreferences: handleSavePreferences,
				onGetPreferences: handleGetPreferences,
				get currentPreferences() {
					return $.get(currentPreferences);
				}
			});
		};

		var consequent_4 = ($$anchor) => {
			Extensions($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				},
				onInstall: onExtensionInstalled
			});
		};

		var consequent_5 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_3 = $.first_child(fragment_6);

			$.key(node_3, () => uiStore.currentRunningPlugin?.pluginPath, ($$anchor) => {
				PluginRunner($$anchor, { onPopView: handlePopView, onToastAction: handleToastAction });
			});

			$.append($$anchor, fragment_6);
		};

		var consequent_6 = ($$anchor) => {
			ClipboardHistoryView($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				}
			});
		};

		var consequent_7 = ($$anchor) => {
			SearchSnippets($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				}
			});
		};

		var consequent_8 = ($$anchor) => {
			QuicklinkForm($$anchor, {
				get quicklink() {
					return $.get(quicklinkToEdit);
				},

				get onBack() {
					return viewManager.showCommandPalette;
				},

				get onSave() {
					return viewManager.showCommandPalette;
				}
			});
		};

		var consequent_9 = ($$anchor) => {
			SnippetForm($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				},

				get onSave() {
					return viewManager.showCommandPalette;
				}
			});
		};

		var consequent_10 = ($$anchor) => {
			ImportSnippets($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				},

				get snippetsToImport() {
					return $.get(snippetsForImport);
				}
			});
		};

		var consequent_11 = ($$anchor) => {
			FileSearchView($$anchor, {
				get onBack() {
					return viewManager.showCommandPalette;
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(currentView) === 'command-palette') $$render(consequent_2); else if ($.get(currentView) === 'settings') $$render(consequent_3, 1); else if ($.get(currentView) === 'extensions-store') $$render(consequent_4, 2); else if ($.get(currentView) === 'plugin-running') $$render(consequent_5, 3); else if ($.get(currentView) === 'clipboard-history') $$render(consequent_6, 4); else if ($.get(currentView) === 'search-snippets') $$render(consequent_7, 5); else if ($.get(currentView) === 'quicklink-form') $$render(consequent_8, 6); else if ($.get(currentView) === 'create-snippet-form') $$render(consequent_9, 7); else if ($.get(currentView) === 'import-snippets') $$render(consequent_10, 8); else if ($.get(currentView) === 'file-search') $$render(consequent_11, 9);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}