export class Box {
	value = $state(0);
	bump() { this.value = this.value + 1; }
}
