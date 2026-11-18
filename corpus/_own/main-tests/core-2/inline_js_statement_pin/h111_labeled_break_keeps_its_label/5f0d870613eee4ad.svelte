<script>
            function h() {
                outer: for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (j === 5) break outer;
                    }
                }
            }
        </script>{h()}