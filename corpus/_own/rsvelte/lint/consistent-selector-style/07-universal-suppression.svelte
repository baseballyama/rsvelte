<script>
  let dynamic = 'anything';
</script>

<div class={dynamic}>bare identifier suppresses class checks</div>
<span class="known">span</span>
<p id="solo">id still checked</p>

<style>
  .known {
    color: red;
  }
  .whatever {
    color: blue;
  }
  #solo {
    color: green;
  }
</style>
