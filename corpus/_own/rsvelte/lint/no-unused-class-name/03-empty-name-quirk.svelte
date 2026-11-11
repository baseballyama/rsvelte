<script>
  let a = 'x';
  let b = 'y';
</script>

<div class="{a} {b}">whitespace-only run between mustaches</div>
<div class="{a}{b}">no run</div>
<div class="lead {a}">leading literal</div>

<style>
  .lead {
    color: red;
  }
</style>
