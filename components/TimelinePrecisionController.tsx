'use client';

import { useEffect } from 'react';

export default function TimelinePrecisionController() {
  useEffect(() => {
    const fill = document.querySelector<HTMLElement>('.timeline-fill');
    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-marker]'));

    if (!fill || markers.length === 0) return;

    let frame = 0;
    const activationOffset = 10;

    const sync = () => {
      const fillBottom = fill.getBoundingClientRect().bottom;
      let activeIndex = -1;

      markers.forEach((marker, index) => {
        const rect = marker.getBoundingClientRect();
        const markerCenter = rect.top + rect.height / 2;
        const passed = fillBottom >= markerCenter + activationOffset;

        marker.classList.toggle('flow-passed', passed);
        marker.classList.remove('flow-active');
        if (passed) activeIndex = index;
      });

      if (activeIndex >= 0) markers[activeIndex]?.classList.add('flow-active');
      frame = window.requestAnimationFrame(sync);
    };

    frame = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
