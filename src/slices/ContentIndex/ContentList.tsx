"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdArrowOutward } from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

export default function ContentList() {
  const component = useRef(null);
  const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const projectSpansRef = useRef<Array<HTMLSpanElement | null>>([]);
  const revealRef = useRef(null);

  const [currentItem, setCurrentItem] = useState<null | number>(null);
  const [hovering, setHovering] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "elastic.out(1,0.3)",
            stagger: 0.2,
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100px",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          }
        );
      });

      return () => ctx.revert();
    }, component);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mousePos = { x: e.clientX, y: e.clientY + window.scrollY };
      const speed = Math.sqrt(Math.pow(mousePos.x - lastMousePos.current.x, 2));

      let ctx = gsap.context(() => {
        if (currentItem !== null) {
          const maxY = window.scrollY + window.innerHeight - 350;
          const maxX = window.innerWidth - 250;

          gsap.to(revealRef.current, {
            x: gsap.utils.clamp(0, maxX, mousePos.x - 110),
            y: gsap.utils.clamp(0, maxY, mousePos.y - 160),
            rotation: speed * (mousePos.x > lastMousePos.current.x ? 1 : -1),
            ease: "back.out(2)",
            duration: 1.3,
          });
          gsap.to(revealRef.current, {
            opacity: hovering ? 1 : 0,
            visibility: "visible",
            ease: "power3.out",
            duration: 0.4,
          });
        }
        lastMousePos.current = mousePos;
        return () => ctx.revert();
      }, component);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hovering, currentItem]);

  const onMouseEnter = (index: number) => {
    if (currentItem !== null && currentItem !== index) {
      // Reset the scale and position of the previously hovered span
      gsap.to(projectSpansRef.current[currentItem], {
        scale: 1,
        x: 0, // Reset position
        duration: 0.3,
        ease: "power2.out",
      });
    }

    setCurrentItem(index);
    setHovering(true);

    // Enlarge and move the currently hovered span
    gsap.to(projectSpansRef.current[index], {
      scale: 1.5,
      x: 100, // Move slightly to the right
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const onMouseLeave = () => {
    if (currentItem !== null) {
      // Reset the scale and position when no project is hovered
      gsap.to(projectSpansRef.current[currentItem], {
        scale: 1,
        x: 0, // Reset position
        duration: 0.3,
        ease: "power2.out",
      });
    }
    setHovering(false);
    setCurrentItem(null);
  };

  return (
    <>
      <ul
        ref={component}
        className="grid border-b border-b-slate-100"
        onMouseLeave={onMouseLeave}
      >
        {[0, 1, 2].map((index) => (
          <li
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            onMouseEnter={() => onMouseEnter(index)}
            className="list-item opacity-0"
          >
            <a
              href={`/project/${index}`}
              className="flex flex-col justify-between border-t border-t-slate-100 py-10 text-slate-200 md:flex-row"
              aria-label={`Project ${index + 1}`}
            >
              <div className="flex flex-col">
                <span
                  ref={(el) => (projectSpansRef.current[index] = el)}
                  className="text-3xl font-bold inline-block transition-transform duration-300 ease-out"
                >
                  this is the name of Project {index + 1}
                </span>
                <div className="flex gap-3 text-yellow-400">
                </div>
              </div>
              <span className="ml-auto flex items-center gap-2 text-xl font-medium md:ml-0">
                View More <MdArrowOutward />
              </span>
            </a>
          </li>
        ))}

        <div
          className="hover-reveal pointer-events-none absolute left-0 top-0 -z-10 h-[320px] w-[220px] rounded-lg bg-cover bg-center opacity-0 transition-[background] duration-300"
          style={{
            backgroundImage:
              currentItem !== null
                ? `url(https://media.geeksforgeeks.org/wp-content/uploads/20220325175226/WebDevelopmentProjects2.png)`
                : "",
          }}
          ref={revealRef}
        ></div>
      </ul>
    </>
  );
}
