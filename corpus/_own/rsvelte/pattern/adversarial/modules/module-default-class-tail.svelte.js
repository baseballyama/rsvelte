export default class Base {
	value = $state(0);
	doubled = $derived(this.value * 2);

	bump() {
		this.value += 1;
	}
}

export const helper = () => new Base();
