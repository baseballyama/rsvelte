const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends { } {
	e = $state(5);
}
