function hexToRgb(hex: string) {
  // Remove the hash at the front, if there
  let processedHex = hex.replace(/^\s*#|\s*$/g, "");

  // Parse the digits
  if (processedHex.length === 3) {
    processedHex = hex.replace(/(.)/g, "$1$1"); // Convert shorthand form (e.g., "abc") to full form ("aabbcc")
  }

  const bigint = Number.parseInt(processedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

function interpolateColor(color1: string, color2: string, factor: number) {
  // Parse hex codes to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Linearly interpolate each component
  const red = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const green = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const blue = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

  // Convert back to hex
  return `rgb(${red}, ${green}, ${blue})`;
}

document.addEventListener("DOMContentLoaded", () => {
  const snapThreshold = 400;
  const opacityThreshold = 600;
  const graidentThreshold = 700;

  const streamLayers = document.querySelectorAll<HTMLImageElement>("#heroStreams > svg");
  const container = document.querySelector("#heroStreams");
  const opacityLayers = document.querySelectorAll("#opacity_layer");

  let transitionCompletedCount = 0;

  if (!container) return;

  const positions = [
    { left: "11rem", top: "50%", transform: "translateY(-50%)" },
    { left: "2rem", top: "calc(50% + 2rem)", transform: "translateY(-50%)" },
    { left: "-7rem", top: "calc(50% + 4rem)", transform: "translateY(-50%)" },
  ] as const;

  function positionAndFadeInLayers() {
    streamLayers.forEach((layer, index) => {
      const { left, top, transform } = positions[index];
      const entryAnimation = layer.animate(
        [
          { opacity: 0, left, top, transform },
          { opacity: 1, left, top, transform },
        ],
        {
          duration: 500,
          delay: 500 * (index + 1),
          easing: "linear",
          fill: "forwards",
        }
      );

      entryAnimation.onfinish = () => {
        transitionCompletedCount++;
        if (transitionCompletedCount === streamLayers.length) {
          // Execute movement setup after all layers are visible
          setupLayersMovement();
        }
      };
    });
  }

  positionAndFadeInLayers();

  function moveLayers(e: MouseEvent) {
    const { clientX, clientY } = e;
    if (window.scrollY + clientY > window.innerHeight) return;

    requestAnimationFrame(() => {
      const bottomLayerRect = streamLayers[0].getBoundingClientRect();
      const bottomLayerMidX = bottomLayerRect.left + bottomLayerRect.width / 2;
      const bottomLayerMidY = bottomLayerRect.top + bottomLayerRect.height / 2;

      // Calculate the deltas based on the difference between the cursor and the exact center of the container
      let dx = clientX - bottomLayerMidX;
      let dy = clientY - bottomLayerMidY;

      // Calculate the distance from the cursor to the bottom layer's center.
      const distanceToBottomLayerCenter = Math.sqrt(
        (clientX - bottomLayerMidX) ** 2 + (clientY - bottomLayerMidY) ** 2
      );

      const shouldMove = distanceToBottomLayerCenter > snapThreshold;

      streamLayers.forEach((layer, index) => {
        const layerStyles = positions[index];
        const factor = (0.45 * index) / 3;

        if (shouldMove) {
          dx = (clientX - bottomLayerMidX) * factor;
          dy = (clientY - bottomLayerMidY) * factor;

          layer.animate(
            [
              {
                transform: `translate(calc(${dx}px - ${layerStyles.left}), calc(${dy}px - ${layerStyles.top}))`,
              },
            ],
            {
              duration: 100,
              fill: "forwards",
              easing: "linear",
            }
          );
        }
      });
    });
  }

  function handleSnapLayers({ clientX, clientY }: MouseEvent) {
    if (window.scrollY + clientY > window.innerHeight) return;

    requestAnimationFrame(() => {
      const bottomLayerRect = streamLayers[0].getBoundingClientRect();
      const bottomLayerMidX = bottomLayerRect.left + bottomLayerRect.width / 2;
      const bottomLayerMidY = bottomLayerRect.top + bottomLayerRect.height / 2;

      // Calculate the deltas based on the difference between the cursor and the exact center of the container
      let dx = clientX - bottomLayerMidX;
      let dy = clientY - bottomLayerMidY;

      // Calculate the distance from the cursor to the bottom layer's center.
      const distanceToBottomLayerCenter = Math.sqrt(
        (clientX - bottomLayerMidX) ** 2 + (clientY - bottomLayerMidY) ** 2
      );

      const shouldSnap = distanceToBottomLayerCenter <= snapThreshold;

      streamLayers.forEach((layer, index) => {
        const layerRect = layer.getBoundingClientRect();
        const layerStyles = positions[index];

        dx = bottomLayerRect.left - layerRect.left;
        dy = bottomLayerRect.top - layerRect.top;

        if (shouldSnap) {
          layer.animate(
            [
              {
                transform: `translate(calc(${dx}px - ${layerStyles.left}), calc(${dy}px - ${layerStyles.top}))`,
              },
            ],
            {
              duration: 600,
              fill: "forwards",
              easing: "linear",
              composite: "replace",
            }
          );
        }
      });
    });
  }

  function handleOpacity({ clientX, clientY }: MouseEvent) {
    if (window.scrollY + clientY > window.innerHeight) return;

    requestAnimationFrame(() => {
      const bottomLayerRect = streamLayers[0].getBoundingClientRect();
      const bottomLayerMidX = bottomLayerRect.left + bottomLayerRect.width / 2;
      const bottomLayerMidY = bottomLayerRect.top + bottomLayerRect.height / 2;

      // Calculate the deltas based on the difference between the cursor and the exact center of the container
      let dx = clientX - bottomLayerMidX;
      let dy = clientY - bottomLayerMidY;

      // Calculate the distance from the cursor to the bottom layer's center.
      const distanceToBottomLayerCenter = Math.sqrt(
        (clientX - bottomLayerMidX) ** 2 + (clientY - bottomLayerMidY) ** 2
      );

      for (const layer of opacityLayers) {
        const layerRect = layer.getBoundingClientRect();

        dx = bottomLayerRect.left - layerRect.left;
        dy = bottomLayerRect.top - layerRect.top;
        const newOpacity = Math.max(distanceToBottomLayerCenter / opacityThreshold - 0.2, 0);

        layer.animate([{ fillOpacity: newOpacity }], {
          duration: 200,
          fill: "forwards",
          easing: "ease-in-out",
          composite: "replace",
        });
      }
    });
  }

  function handleGradientLayer(event: MouseEvent) {
    if (window.scrollY + event.clientY > window.innerHeight) return;

    requestAnimationFrame(() => {
      const backgroundLayer = document.getElementById("overlay_layer");

      const bottomLayerRect = streamLayers[0].getBoundingClientRect();
      const bottomLayerMidX = bottomLayerRect.left + bottomLayerRect.width / 2;
      const bottomLayerMidY = bottomLayerRect.top + bottomLayerRect.height / 2;

      const distanceToBottomLayerCenter = Math.sqrt(
        (event.clientX - bottomLayerMidX) ** 2 + (event.clientY - bottomLayerMidY) ** 2
      );

      const normalizeDistance = distanceToBottomLayerCenter / graidentThreshold;
      const opacity = normalizeDistance < 1 ? (1 - normalizeDistance) ** 2 : 0;

      backgroundLayer?.animate([{ fillOpacity: opacity }], {
        duration: 200,
        fill: "forwards",
        easing: "ease-in-out",
        composite: "replace",
      });

      document
        .getElementById("backgroundGradient")
        ?.children[0].animate([{ stopColor: interpolateColor("#161127", "#302555", opacity) }], {
          duration: 200,
          fill: "forwards",
          easing: "ease-in-out",
          composite: "replace",
        });
      document
        .getElementById("backgroundGradient")
        ?.children[1].animate([{ stopColor: interpolateColor("#161127", "#EE5E28", opacity) }], {
          duration: 200,
          fill: "forwards",
          easing: "ease-in-out",
          composite: "replace",
        });
    });
  }

  function setupLayersMovement() {
    document.addEventListener("mousemove", handleSnapLayers);
    document.addEventListener("mousemove", moveLayers);
    document.addEventListener("mousemove", handleOpacity);
    document.addEventListener("mousemove", handleGradientLayer);
  }
});
