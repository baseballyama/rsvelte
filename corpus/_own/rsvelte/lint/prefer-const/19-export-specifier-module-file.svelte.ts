let exported = 1;
export { exported };
export let named = 2;
let internal = 3;
void internal;

export function each(items: number[]): void {
	for (let item of items) {
		void item;
	}
}
