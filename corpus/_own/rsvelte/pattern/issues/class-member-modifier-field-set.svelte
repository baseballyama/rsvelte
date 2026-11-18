<script lang="ts">
	class Base {
		run() {}
	}

	class Written extends Base {
		private a = 1;
		protected b = 2;
		readonly c = 3;
		declare d: number;
		e?: number;
		f!: number;
		accessor g = 4;
		override run() {}
	}

	// The control, and the half a one-directional fix gets wrong: a member with
	// nothing written must carry NO modifier key at all, not `false`.
	class Plain {
		h = 1;
		i() {}
	}

	export const kinds = [Written, Plain];
</script>

<p>{kinds.length}</p>
