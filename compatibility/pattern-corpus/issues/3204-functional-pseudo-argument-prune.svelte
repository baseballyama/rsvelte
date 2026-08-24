<div><b class="a">x</b></div>

<style>
  :is(b, i) {
    color: red;
  }
  :where(b, i) {
    color: green;
  }
  div:has(b, i) {
    color: blue;
  }
  :is(b.a, i.a) {
    color: teal;
  }
  div :is(b, i) {
    color: olive;
  }
  :not(b, i) {
    color: navy;
  }
</style>
