const mixin = (b) => b;

class Base {
	n = $state(0);
}

const ns = { Base };

export class ByName extends Base {
	a = $state(1);
}

export class ByCall extends mixin(Base) {
	b = $state(2);
}

export class ByMember extends ns.Base {
	c = $state(3);
}

export class BySequence extends (0, Base) {
	d = $state(4);
}

export class ByFunction extends function () {} {
	e = $state(5);
}
