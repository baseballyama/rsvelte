import { invoke } from '@tauri-apps/api/core';

type FrecencyDataItem = {
	itemId: string;
	useCount: number;
	lastUsedAt: number;
};

class FrecencyStore {
	data = $state<FrecencyDataItem[]>([]);
	isLoading = $state(true);
	hiddenItemIds = $state<string[]>([]);

	constructor() {
		this.fetchData();
		this.fetchHiddenItems();
	}

	async fetchData() {
		this.isLoading = true;
		try {
			this.data = await invoke<FrecencyDataItem[]>('get_frecency_data');
		} catch (e) {
			console.error('Failed to fetch frecency data:', e);
			this.data = [];
		} finally {
			this.isLoading = false;
		}
	}

	async fetchHiddenItems() {
		try {
			this.hiddenItemIds = await invoke<string[]>('get_hidden_item_ids');
		} catch (e) {
			console.error('Failed to fetch hidden items:', e);
		}
	}

	async recordUsage(itemId: string) {
		try {
			await invoke('record_usage', { itemId });
			this.fetchData();
		} catch (e) {
			console.error(`Failed to record usage for ${itemId}:`, e);
		}
	}

	async deleteEntry(itemId: string) {
		try {
			await invoke('delete_frecency_entry', { itemId });
			await this.fetchData();
		} catch (e) {
			console.error(`Failed to delete frecency entry for ${itemId}:`, e);
		}
	}

	async hideItem(itemId: string) {
		try {
			await invoke('hide_item', { itemId });
			await this.fetchHiddenItems();
		} catch (e) {
			console.error(`Failed to hide item ${itemId}:`, e);
		}
	}
}

export const frecencyStore = new FrecencyStore();
