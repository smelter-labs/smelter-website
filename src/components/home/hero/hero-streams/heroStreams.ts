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
  const streamLayerRects: Array<DOMRect> = [];

  for (const layer of streamLayers) {
    streamLayerRects.push(layer.getBoundingClientRect());
  }

  const containerRect = document.querySelector("#heroStreams")?.getBoundingClientRect();
  const opacityLayers = document.querySelectorAll("#opacity_layer");

  const transitionCompletedCount = 0;

  if (!containerRect) return;

  const middle = {
    x: containerRect.left + containerRect.width / 2,
    y: containerRect.top + containerRect.height / 2,
  };

  const positions = [
    { left: "11rem", top: "50%", transform: "translateY(-50%)" },
    { left: "2rem", top: "calc(50% + 2rem)", transform: "translateY(-50%)" },
    { left: "-7rem", top: "calc(50% + 4rem)", transform: "translateY(-50%)" },
  ] as const;

  function positionAndFadeInLayers() {
    let transitionCompletedCount = 0;

    streamLayers.forEach((layer, index) => {
      const { left, top } = positions[index];
      // Setting initial positions before the animation starts
      //   layer.style.left = `${left}`;
      //   layer.style.top = `${top}`;

      const entryAnimation = layer.animate(
        [
          { opacity: 0 },
          { opacity: 0.4, transform: `translate(-${index * 5}rem, ${2 * index}rem)` },
          { opacity: 1, transform: `translate(-${index * 5}rem, ${2 * index}rem)` },
        ],
        {
          duration: 600,
          delay: 500 * index, // Adjusted delay to start immediately for first
          easing: "linear",
          fill: "forwards",
        }
      );

      entryAnimation.onfinish = () => {
        transitionCompletedCount++;
        if (transitionCompletedCount === streamLayers.length) {
          // All layers are faded in, proceed to set up layer movements
          setupLayersMovement();
        }
      };
    });
  }

  positionAndFadeInLayers();

  const { left, top, width, height } = streamLayers[0].getBoundingClientRect();
  const bottomLayerMidX = left + width / 2;
  const bottomLayerMidY = top + height / 2;

  function moveLayers({ clientX, clientY }: MouseEvent) {
    console.log("CLIENT X ", clientX);

    if (window.scrollY + clientY > window.innerHeight) return;

    requestAnimationFrame(() => {
      for (let index = 0; index < streamLayers.length; index++) {
        const factor = (0.45 * (index + 1)) / 3;
        const layerOffset = {
          x: (clientX - bottomLayerMidX) * factor,
          y: (clientY - bottomLayerMidY) * factor,
        };

        const distanceToBottomLayerCenter = Math.sqrt(
          (clientX - bottomLayerMidX) ** 2 + (clientY - bottomLayerMidY) ** 2
        );
        const shouldSnap = distanceToBottomLayerCenter <= snapThreshold;

        if (shouldSnap) {
          streamLayers[index].animate(
            [
              {
                transform: `translate(${left - streamLayerRects[index].left}px, ${top - streamLayerRects[index].top}px)`,
              },
            ],
            {
              duration: 600,
              fill: "forwards",
              easing: "linear",
              composite: "replace",
            }
          );
        } else {
          streamLayers[index].animate(
            [{ transform: `translate(${layerOffset.x}px, ${layerOffset.y}px)` }],
            {
              duration: 400,
              easing: "linear",
              fill: "forwards",
            }
          );
        }
      }
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
    const animations = [];

    // for (const layer of streamLayers) {
    //   const layerRect = layer.getBoundingClientRect();
    //   const offsetX = middle.x - (layerRect.left + layerRect.width / 2);
    //   const offsetY = middle.y - (layerRect.top + layerRect.height / 2);
    //   const animation = layer.animate([{ transform: `translate(${offsetX}px, ${offsetY}px)` }], {
    //     duration: 500,
    //     easing: "ease-out",
    //   });
    //   animations.push(animation.finished); // Collect the promise of each animation's completion
    // }

    // // Execute the rest of the setup only after all animation promises have resolved
    // Promise.all(animations)
    //   .then(() => {
    //     window.addEventListener("mousemove", moveLayers);
    //     document.addEventListener("mousemove", handleOpacity);
    //     document.addEventListener("mousemove", handleGradientLayer);
    //   })
    //   .catch((error) => {
    //     console.error("An error occurred with the animations: ", error);
    //   });

    window.addEventListener("mousemove", moveLayers);
    document.addEventListener("mousemove", handleOpacity);
    document.addEventListener("mousemove", handleGradientLayer);
  }
});
