import { invoke } from '@tauri-apps/api/core';
import { frecencyStore } from './frecency.svelte';

export type App = { name: string; comment?: string; exec: string; icon_path?: string };

class AppsStore {
	rawApps = $state<App[]>([]);
	isLoading = $state(true);
	apps = $derived(this.rawApps.filter((app) => !frecencyStore.hiddenItemIds.includes(app.exec)));

	constructor() {
		this.fetchApps();
	}

	async fetchApps() {
		this.isLoading = true;
		try {
			this.rawApps = await invoke<App[]>('get_installed_apps');
		} catch (e) {
			console.error('Failed to fetch installed apps:', e);
			this.rawApps = [];
		} finally {
			this.isLoading = false;
		}
	}
}

export const appsStore = new AppsStore();
