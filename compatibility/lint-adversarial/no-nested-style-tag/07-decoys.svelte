<script>
  const s = '<style>p { color: red; }</style>';
</script>

<!-- <style>p { color: red; }</style> in comment -->
<p>{s}</p>
<div data-style="x">attr decoy</div>

<style>
  p {
    color: green;
  }
</style>
