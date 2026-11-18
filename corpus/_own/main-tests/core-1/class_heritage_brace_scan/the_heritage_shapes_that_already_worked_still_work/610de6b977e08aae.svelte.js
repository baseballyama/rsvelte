const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends mixin(class {}, function () {}) {
	e = $state(5);
}
