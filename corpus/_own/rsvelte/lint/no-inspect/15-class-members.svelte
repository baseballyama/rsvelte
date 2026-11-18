<script>
	class Probe {
		$inspect = 1;
		static $inspect = 2;
		static {
			void Probe.$inspect;
		}
		$inspect2() {
			return 3;
		}
		get $inspect_() {
			return 4;
		}
	}
	void new Probe();
</script>
<p>class members</p>
