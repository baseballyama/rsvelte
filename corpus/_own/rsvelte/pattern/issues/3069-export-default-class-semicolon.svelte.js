class Base {
	// export default class NotThis {} — a comment must not start the scan
	tag = 'base';
}

export default class Outer extends Base {
	n = $state(0);
	doubled = $derived(this.n * 2);
};

export const k = 1;
