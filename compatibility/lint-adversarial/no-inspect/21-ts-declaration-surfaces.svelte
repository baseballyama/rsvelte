<script lang="ts">
	interface Holder {
		$inspect: number;
	}
	enum Kind {
		$inspect = 1
	}
	namespace outer {
		export type $inspect = string;
	}
	function generic<$inspect>(v: $inspect): $inspect {
		return v;
	}
	const h: Holder = { $inspect: Kind.$inspect };
	const q: outer.$inspect = 'x';
	// $inspect in a comment is not an identifier
	const decoy = '$inspect';
	void [generic, h, q, decoy];
</script>
<p>type surfaces</p>
