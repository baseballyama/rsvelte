<div class="host">a</div>

<style>
  .host {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    -moz-osx-font-smoothing: grayscale;
    -ms-overflow-style: none;
    -webkit-appearance: none;
    appearance: none;
    background: -webkit-linear-gradient(red, blue);
    background: linear-gradient(red, blue);
    display: -webkit-box;
    display: flex;
  }

  .host::-webkit-scrollbar {
    width: 1px;
  }

  .host::-moz-selection {
    color: red;
  }

  .host:-moz-focusring {
    outline: none;
  }

  @-webkit-keyframes spin {
    from {
      transform: rotate(0deg);
    }
  }

  @supports (-webkit-touch-callout: none) {
    .host {
      color: red;
    }
  }
</style>
