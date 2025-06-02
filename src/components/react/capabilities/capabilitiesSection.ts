import { throttle } from "@utils/misc";

document.addEventListener("astro:page-load", () => {
  const capabilitiesBlur = document.getElementById("capabilitiesBlur");
  const capabilitiesWave = document.getElementById("capabilitiesWave");

  const parentSection = capabilitiesBlur?.closest("section");

  const handleScroll = () => {
    if (!parentSection) return;
    const sectionBottom = parentSection.getBoundingClientRect().bottom;
    const scrollY = window.screenY;
    const sectionBottomToPageTop = scrollY + sectionBottom;
    const relativeBottom = scrollY - sectionBottomToPageTop + window.innerHeight;

    if (relativeBottom > -window.innerHeight && sectionBottom < window.innerHeight) {
      const translateY = relativeBottom;
      if (capabilitiesBlur)
        capabilitiesBlur.style.transform = `translateY(-${translateY * 0.7}px) translateX(-50%)`;
      if (capabilitiesWave) capabilitiesWave.style.transform = `translateY(${translateY * 0.4}px)`;
    }
  };

  handleScroll();

  const throttledHandleScroll = throttle(handleScroll, 50);
  window.addEventListener("scroll", throttledHandleScroll);
});
