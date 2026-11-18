<script>
	import { writable } from 'svelte/store';

	const count = writable(0);

	class Probe {
		$inspect = 1;
		static $inspect = 2;

		static {
			void Probe.$inspect;
		}

		$abc() {
			return 3;
		}

		get $def() {
			return 4;
		}

		*$gen() {
			yield 5;
		}

		async $am() {
			return 6;
		}

		$bare;
		read = $count;
		mixed = [1][0] || $count;
		asi = 1
		$asiName() {
			return 7;
		}
		asiArray = [1, 2]
		$asiAfterBracket() {
			return 8;
		}
		fromKeyword = new Set([$count])
		$asiAfterCall() {
			return 9;
		}
	}

	const probe = new Probe();
</script>

<p>{probe.read}{probe.mixed}{probe.$abc()}</p>
