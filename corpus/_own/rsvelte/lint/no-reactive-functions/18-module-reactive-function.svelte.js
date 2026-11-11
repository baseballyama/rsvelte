let render = () => 0;
$: render = () => 1;
void render;
