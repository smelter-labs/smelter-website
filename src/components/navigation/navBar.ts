import { throttle } from "@utils/misc";

document.addEventListener("astro:page-load", () => {
  const header = document.getElementById("pageHeader");

  function handleOpacity() {
    const scrollDistanceLimit = 150;
    const alphaDecimal = Math.min(235, (window.scrollY / scrollDistanceLimit) * 235);
    const alphaHex = Math.round(alphaDecimal).toString(16).padStart(2, "0");
    if (header) header.style.backgroundColor = `#161127${alphaHex}`;
  }

  handleOpacity();

  const throttledHandleOpacity = throttle(handleOpacity, 50);

  window.addEventListener("scroll", throttledHandleOpacity, {
    passive: true,
  });
});
