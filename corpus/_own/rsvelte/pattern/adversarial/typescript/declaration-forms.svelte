<script lang="ts">
  declare const injected: number;

  abstract class Shape {
    abstract area(): number;

    describe(): string {
      return `area=${this.area()}`;
    }
  }

  class Square extends Shape {
    readonly side: number;

    constructor(side: number) {
      super();
      this.side = side;
    }

    area(): number {
      return this.side ** 2;
    }
  }

  function overloaded(value: string): string;
  function overloaded(value: number): number;
  function overloaded(value: unknown): unknown {
    return value;
  }

  const square = new Square(2);
</script>

<b>{square.describe()}</b>
<b>{overloaded("a")}{overloaded(1)}</b>
<b>{typeof injected}</b>
