const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends function () { return Base; }() {
	e = $state(5);
}
