<script>
  let on = $state(true);
  const spreadable = { class: "from-spread" };
</script>

<div class="kept">a</div>
<div class={on ? "ternary-a" : "ternary-b"}>b</div>
<div class:toggled={on}>c</div>
<div {...spreadable}>d</div>
{#if on}
  <div class="conditional">e</div>
{/if}
<section class="dynamic-host">f</section>

<style>
  .kept {
    color: red;
  }

  .ternary-a,
  .ternary-b {
    color: blue;
  }

  .toggled {
    color: green;
  }

  .from-spread {
    color: teal;
  }

  .conditional {
    color: olive;
  }

  .dynamic-host {
    color: navy;
  }

  .never-matches {
    color: gray;
  }

  :global(.never-matches-global) {
    color: black;
  }
</style>
