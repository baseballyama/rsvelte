export interface Item {
	id: number;
	label?: string;
}

let items = $state<Item[]>([]);
let total = $derived(items.length as number);

export function add(item: Item): void {
	items = [...items, item satisfies Item];
}

export class Store<T extends Item = Item> {
	private cache = $state(new Map<number, T>());
	readonly created = Date.now();

	get size(): number {
		return this.cache.size;
	}

	put(this: Store<T>, item: T): T | undefined {
		const prev = this.cache.get(item.id);
		this.cache.set(item.id, item);
		return prev;
	}
}

export const totals = (): number => total;
