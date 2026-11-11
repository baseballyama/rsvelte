const label = 'class name';
export class Store {
	value = $state(0);
	double = $derived(this.value * 2);
}
