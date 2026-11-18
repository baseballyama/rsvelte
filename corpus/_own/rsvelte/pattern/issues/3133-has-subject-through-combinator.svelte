<div class="a"><b class="b">x</b></div>

<style>
  .a :has(.b) {
    color: red;
  }
  .a > :has(.b) {
    color: green;
  }
  .a:has([x]) {
    color: blue;
  }
  .a:has([x="y" i]) {
    color: teal;
  }
  .a {
    & :has(.b) {
      color: olive;
    }
  }
  .a:has(.b) {
    color: navy;
  }
</style>
