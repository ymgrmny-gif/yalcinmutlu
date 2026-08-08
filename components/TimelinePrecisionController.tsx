'use client';

import { useEffect } from 'react';

export default function TimelinePrecisionController() {
  useEffect(() => {
    const fill = document.querySelector<HTMLElement>('.timeline-fill');
    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-marker]'));

    if (!fill || markers.length === 0) return;

    let frame = 0;
    let settleUntil = 0;
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

      if (performance.now() < settleUntil) {
        frame = window.requestAnimationFrame(sync);
      }
    };

    const schedule = () => {
      settleUntil = performance.now() + 180;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sync);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(fill, { attributes: true, attributeFilter: ['style'] });

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return null;
}
