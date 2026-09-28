import { invoke } from '@tauri-apps/api/core';

export type Quicklink = {
	id: number;
	name: string;
	link: string;
	application: string | null;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
};

class QuicklinksStore {
	quicklinks = $state<Quicklink[]>([]);
	isLoading = $state(true);
	error = $state<string | null>(null);

	constructor() {
		this.fetchQuicklinks();
	}

	async fetchQuicklinks() {
		this.isLoading = true;
		this.error = null;
		try {
			const result = await invoke<Quicklink[]>('list_quicklinks');
			this.quicklinks = result;
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
			console.error('Failed to fetch quicklinks:', e);
		} finally {
			this.isLoading = false;
		}
	}

	async create(data: { name: string; link: string; application?: string; icon?: string }) {
		try {
			await invoke('create_quicklink', data);
			await this.fetchQuicklinks();
		} catch (e) {
			console.error('Failed to create quicklink:', e);
			throw e;
		}
	}

	async update(
		id: number,
		data: { name: string; link: string; application?: string; icon?: string }
	) {
		try {
			await invoke('update_quicklink', { id, ...data });
			await this.fetchQuicklinks();
		} catch (e) {
			console.error('Failed to update quicklink:', e);
			throw e;
		}
	}

	async delete(id: number) {
		try {
			await invoke('delete_quicklink', { id });
			await this.fetchQuicklinks();
		} catch (e) {
			console.error('Failed to delete quicklink:', e);
			throw e;
		}
	}
}

export const quicklinksStore = new QuicklinksStore();
