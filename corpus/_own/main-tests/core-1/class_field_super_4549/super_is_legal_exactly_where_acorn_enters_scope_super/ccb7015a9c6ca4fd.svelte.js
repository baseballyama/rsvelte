class B { load(){} constructor(){} }
class C extends B { constructor(){ (() => { super(); })(); } }