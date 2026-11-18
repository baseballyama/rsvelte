const mixin = (b) => b;
class Base { n = $state(0); }
const ns = { Base };
export class Sub extends String.raw`${{ a: 1 }}` {
	e = $state(5);
}
