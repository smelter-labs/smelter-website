function beforeThemeTransition() {
  const doc = document.documentElement;
  const onTransitionDone = () => {
    doc.classList.remove('tokenwind');
    doc.removeEventListener('transitionend', onTransitionDone);
  };
  doc.addEventListener('transitionend', onTransitionDone);
  if (!doc.classList.contains('tokenwind')) {
    doc.classList.add('tokenwind');
  }
}

export { beforeThemeTransition };
