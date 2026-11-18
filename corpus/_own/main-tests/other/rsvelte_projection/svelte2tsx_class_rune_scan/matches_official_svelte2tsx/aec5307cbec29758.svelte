<script>
class Outer { m() { const C = class { m($effect) { $effect(() => {}); } }; } }
</script>

<p>{typeof K}</p>
