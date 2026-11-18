class B { load(){} constructor(){} }
class C extends B { [super.load()] = 1; }