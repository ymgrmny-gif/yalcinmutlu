'use client';

import { useEffect } from 'react';
import { siteData } from '@/data/siteData';

export default function ProjectLinksController() {
  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.project-card .project-link'));
    const cleanups = buttons.map((button, index) => {
      const project = siteData.projects[index];
      if (!project) return () => undefined;

      const onClick = () => {
        window.location.href = `/projects/#${project.id}`;
      };

      button.addEventListener('click', onClick);
      return () => button.removeEventListener('click', onClick);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
