<script lang="ts">
	declare const injected: number;
	declare function f(): number;
	declare class C {}
	declare var v: number;
	let p = $props();
	if (p) {
		var real = "x";
		{
			var deep = 1;
		}
	}
	var top = "t";
</script>

<b>{f()}</b><i>{C}</i><s>{v}</s><u>{real}</u><span>{deep}</span><em>{top}</em><q>{typeof injected}</q>
