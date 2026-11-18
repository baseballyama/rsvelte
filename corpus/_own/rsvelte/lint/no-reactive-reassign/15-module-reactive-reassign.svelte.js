let items = [];
$: items = [1, 2];
export function grow() {
	items.push(3);
	items = items;
}
void items;
