const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends (0, Base) {
	e = $state(5);
}
