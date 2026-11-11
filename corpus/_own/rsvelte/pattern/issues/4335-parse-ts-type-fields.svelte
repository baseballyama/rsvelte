<script lang="ts">
	function id<T>(v: T): T {
		return v;
	}

	class Box<T extends object = {}> extends Map<string, T> {
		private label: string = 'b';
		readonly kind: string = 'box';

		wrap<U>(u: U): U {
			return id(u);
		}

		get value(): string {
			return this.label + this.kind;
		}
	}

	const make = function (): Box<Record<string, string>> {
		return new Box<Record<string, string>>();
	};
	const pick = (): string => id<string>('x');

	let later!: string;
	later = pick();

	const b = make();
	let out = $state(b.value + later + b.wrap('w'));
</script>

<p>{out}</p>
