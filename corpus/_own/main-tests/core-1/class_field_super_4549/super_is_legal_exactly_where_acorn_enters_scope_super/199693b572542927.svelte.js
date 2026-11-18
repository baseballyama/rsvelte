class B { load(){} constructor(){} }
class C extends B { static f = () => super.load(); }