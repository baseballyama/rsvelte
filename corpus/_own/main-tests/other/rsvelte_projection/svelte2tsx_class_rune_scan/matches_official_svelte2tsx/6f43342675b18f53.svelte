<script>
class Outer { m() { const C = class { static { $effect(() => {}); } }; } }
</script>

<p>{typeof K}</p>
