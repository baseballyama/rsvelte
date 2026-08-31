<script lang="ts">
	const enum Direction {
		Up = 1,
		Down,
		'Left' = 'l'
	}

	declare enum Ambient {
		A
	}

	export enum Plain {
		A
	}

	let d: Direction = Direction.Up;
	let a: Ambient = Ambient.A;
	let p: Plain = Plain.A;
</script>

<p>{d}{a}{p}</p>
