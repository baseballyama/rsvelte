<script>
  let kind = 'primary';
  const cls = 'btn-' + kind;
</script>

<button type="button" class={cls}>resolved variable affix</button>
<div class="standalone">exact class</div>

<style>
  .btn-primary {
    color: red;
  }
  .standalone {
    color: blue;
  }
</style>
