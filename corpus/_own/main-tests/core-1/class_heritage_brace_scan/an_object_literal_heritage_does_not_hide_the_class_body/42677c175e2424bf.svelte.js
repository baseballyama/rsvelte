const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends { a: 1 } {
	e = $state(5);
}
