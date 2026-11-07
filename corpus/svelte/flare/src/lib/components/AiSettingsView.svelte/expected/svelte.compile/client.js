import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Switch } from './ui/switch';
import { invoke } from '@tauri-apps/api/core';
import { onMount } from 'svelte';
import PasswordInput from './PasswordInput.svelte';
import { uiStore } from '$lib/ui.svelte';

var root = $.from_html(`<span class="text-sm font-medium"> </span> <!>`, 1);
var root_1 = $.from_html(`<div class="mx-auto max-w-screen-md space-y-6 p-6"><div class="space-y-2"><h3 class="text-lg font-medium">General AI Settings</h3> <div class="flex items-center space-x-2"><!> <label for="ai-enabled" class="text-sm font-medium">Enable AI Features</label></div></div> <div class="space-y-2"><h3 class="text-lg font-medium">API Key</h3> <p class="text-muted-foreground text-sm">Your OpenRouter API key is stored securely in your system's keychain.</p> <div class="flex items-center gap-2"><!> <!></div></div> <div class="space-y-2"><h3 class="text-lg font-medium">Model Associations</h3> <p class="text-muted-foreground text-sm">Associate internal model identifiers with specific models available through OpenRouter.</p> <div class="grid grid-cols-[auto_1fr] items-center gap-4"></div></div> <div class="flex justify-end"><!></div></div>`);

export default function AiSettingsView($$anchor, $$props) {
	$.push($$props, true);

	let aiEnabled = $.state(false);
	let apiKey = $.state('');
	let modelAssociations = $.state($.proxy({}));
	let isApiKeySet = $.state(false);

	async function loadSettings() {
		try {
			$.set(isApiKeySet, await invoke('is_ai_api_key_set'), true);

			const settings = await invoke('get_ai_settings');

			$.set(aiEnabled, settings.enabled, true);
			$.set(modelAssociations, settings.modelAssociations ?? {}, true);
		} catch(error) {
			console.error('Failed to load AI settings:', error);

			uiStore.toasts.set(Date.now(), {
				id: Date.now(),
				title: 'Failed to load AI settings',
				message: String(error),
				style: 'FAILURE'
			});
		}
	}

	async function saveSettings() {
		try {
			if ($.get(apiKey)) {
				await invoke('set_ai_api_key', { key: $.get(apiKey) });
				$.set(apiKey, '');
			}

			const settingsToSave = {
				enabled: $.get(aiEnabled),
				modelAssociations: $.get(modelAssociations)
			};

			await invoke('set_ai_settings', { settings: settingsToSave });
			uiStore.toasts.set(Date.now(), { id: Date.now(), title: 'AI Settings Saved', style: 'SUCCESS' });
			await loadSettings();
		} catch(error) {
			console.error('Failed to save AI settings:', error);

			uiStore.toasts.set(Date.now(), {
				id: Date.now(),
				title: 'Failed to save AI settings',
				message: String(error),
				style: 'FAILURE'
			});
		}
	}

	async function clearApiKey() {
		await invoke('clear_ai_api_key');
		$.set(apiKey, '');
		await loadSettings();
	}

	onMount(loadSettings);

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Switch(node, {
		id: 'ai-enabled',
		get checked() {
			return $.get(aiEnabled);
		},

		set checked($$value) {
			$.set(aiEnabled, $$value, true);
		}
	});

	$.next(2);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 4);
	var node_1 = $.child(div_4);

	{
		let $0 = $.derived(() => $.get(isApiKeySet) ? '••••••••••••' : 'Enter your OpenRouter API key');

		PasswordInput(node_1, {
			get placeholder() {
				return $.get($0);
			},
			class: 'flex-grow',
			get value() {
				return $.get(apiKey);
			},

			set value($$value) {
				$.set(apiKey, $$value, true);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'destructive',
				onclick: clearApiKey,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Clear');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(isApiKeySet)) $$render(consequent);
		});
	}

	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.sibling($.child(div_5), 4);

	$.each(div_6, 21, () => Object.entries($.get(modelAssociations)), ([raycastModel, openRouterModel]) => raycastModel, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let raycastModel = () => $.get($$array)[0];
		let openRouterModel = () => $.get($$array)[1];
		var fragment_1 = root();
		var span = $.first_child(fragment_1);
		var text_1 = $.only_child(span, true);
		var node_3 = $.sibling(span, 2);

		Input(node_3, {
			get value() {
				return openRouterModel();
			},

			onchange: (e) => {
				$.get(modelAssociations)[raycastModel()] = e.target?.value;
			},
			class: 'w-full'
		});

		$.template_effect(() => $.set_text(text_1, raycastModel()));
		$.append($$anchor, fragment_1);
	});

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_4 = $.child(div_7);

	Button(node_4, {
		onclick: saveSettings,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Save AI Settings');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}