export class S {
  a;
  b;
  constructor() {
    this.a = $state(
      [1, 2],
    );
    this.b = $state(2);
  }
}
