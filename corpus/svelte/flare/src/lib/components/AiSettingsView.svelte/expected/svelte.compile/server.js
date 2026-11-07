import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Switch } from './ui/switch';
import { invoke } from '@tauri-apps/api/core';
import { onMount } from 'svelte';
import PasswordInput from './PasswordInput.svelte';
import { uiStore } from '$lib/ui.svelte';

export default function AiSettingsView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let aiEnabled = false;
		let apiKey = '';
		let modelAssociations = {};
		let isApiKeySet = false;

		async function loadSettings() {
			try {
				isApiKeySet = await invoke('is_ai_api_key_set');

				const settings = await invoke('get_ai_settings');

				aiEnabled = settings.enabled;
				modelAssociations = settings.modelAssociations ?? {};
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
				if (apiKey) {
					await invoke('set_ai_api_key', { key: apiKey });
					apiKey = '';
				}

				const settingsToSave = { enabled: aiEnabled, modelAssociations };

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
			apiKey = '';
			await loadSettings();
		}

		onMount(loadSettings);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mx-auto max-w-screen-md space-y-6 p-6"><div class="space-y-2"><h3 class="text-lg font-medium">General AI Settings</h3> <div class="flex items-center space-x-2">`);

			Switch($$renderer, {
				id: 'ai-enabled',
				get checked() {
					return aiEnabled;
				},

				set checked($$value) {
					aiEnabled = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <label for="ai-enabled" class="text-sm font-medium">Enable AI Features</label></div></div> <div class="space-y-2"><h3 class="text-lg font-medium">API Key</h3> <p class="text-muted-foreground text-sm">Your OpenRouter API key is stored securely in your system's keychain.</p> <div class="flex items-center gap-2">`);

			PasswordInput($$renderer, {
				placeholder: isApiKeySet ? '••••••••••••' : 'Enter your OpenRouter API key',
				class: 'flex-grow',
				get value() {
					return apiKey;
				},

				set value($$value) {
					apiKey = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (isApiKeySet) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'destructive',
					onclick: clearApiKey,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="space-y-2"><h3 class="text-lg font-medium">Model Associations</h3> <p class="text-muted-foreground text-sm">Associate internal model identifiers with specific models available through OpenRouter.</p> <div class="grid grid-cols-[auto_1fr] items-center gap-4"><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(modelAssociations));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [raycastModel, openRouterModel] = each_array[$$index];

				$$renderer.push(`<span class="text-sm font-medium">${$.escape(raycastModel)}</span> `);

				Input($$renderer, {
					value: openRouterModel,
					onchange: (e) => {
						modelAssociations[raycastModel] = e.target?.value;
					},
					class: 'w-full'
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="flex justify-end">`);

			Button($$renderer, {
				onclick: saveSettings,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save AI Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}