<script lang="ts">
	interface Shape {
		readonly id: string;
		size?: number;
	}

	type Keys = keyof Shape;
	type Mapped = { [K in Keys]-?: Shape[K] };
	type Cond<T> = T extends string ? 's' : 'n';
	type Tpl = `prefix-${Keys & string}`;

	abstract class Base<T extends Shape = Shape> implements Partial<Shape> {
		abstract describe(): string;
		public readonly id: string = 'i';
		declare size: number;
		static #count = 0;

		value: T;
		label: string;

		constructor(value: T, label = 'l') {
			this.value = value;
			this.label = label;
		}

		method<U>(this: Base<T>, u: U): U {
			return u;
		}

		get v(): T {
			return this.value;
		}
	}

	class Impl extends Base {
		protected kind = 'impl';

		describe(): string {
			return this.kind;
		}
	}

	const i = new Impl({ id: 'x' });
	const m = { id: 'y', size: 1 } satisfies Mapped;
	const c: Cond<string> = 's';
	const t: Tpl = 'prefix-id';
	let n = $state<number | undefined>(undefined);
</script>

<p>{i.label}{i.describe()}{m.id}{c}{t}{n ?? 0}</p>
