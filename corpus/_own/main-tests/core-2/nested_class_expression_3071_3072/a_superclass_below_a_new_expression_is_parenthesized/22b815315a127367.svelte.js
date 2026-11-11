const Base = class {};
const mixin = (b) => b;
export class C extends class {} {}
export class G extends function () {} {}
export class D extends (0, Base) {}
export class B extends mixin(Base) {}
export class E extends (Base ?? class {}) {}
export class J extends (true ? Base : Base) {}
