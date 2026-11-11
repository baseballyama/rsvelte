<script>
class Outer { m() { class K { static { $effect(() => {}); } } } }
</script>

<p>{typeof K}</p>
