export class S {
  a;
  constructor(p, f) {
    this.a = $state(f(p));
  }
}
