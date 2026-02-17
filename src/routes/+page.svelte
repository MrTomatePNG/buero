<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let isDrawing = false;

    function startDrawing(e: MouseEvent) {
      isDrawing = true;
      draw(e);
    }

    function stopDrawing() {
      isDrawing = false;
      context?.beginPath();
    }

    function draw(e: MouseEvent) {
      if (!isDrawing) return;
      context.lineWidth = 5;
      context.lineCap = "round";
      context.strokeStyle = "white";

      context.lineTo(e.clientX, e.clientY);
      context.stroke();
      context.beginPath();
      context.moveTo(e.clientX, e.clientY);
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mousemove", draw);
    };
  });
</script>

<canvas bind:this={canvas}></canvas>
