<div class="card wide"><p class="a">x</p><span class="b">y</span></div>

<style>
  .card {
    :is(&) {
      color: red;
    }
    :where(&) {
      color: green;
    }
    :is(&, .b) {
      color: blue;
    }
    :is(&, .nope) {
      color: teal;
    }
    :is(&) .a {
      color: olive;
    }
    :where(&) .b {
      color: navy;
    }
    :is(&) > .a {
      color: maroon;
    }
    :has(&) {
      color: purple;
    }
    :not(&) {
      color: gray;
    }
  }
  .nope {
    :is(&) {
      color: silver;
    }
  }
</style>
