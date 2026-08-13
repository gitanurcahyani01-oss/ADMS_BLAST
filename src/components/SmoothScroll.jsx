import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis with tuned momentum & damping for buttery smoothness
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Connect to requestAnimationFrame loop
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global click listener for smooth anchor link scrolling
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetEl = document.querySelector(anchor.hash);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, {
            offset: -80,
            duration: 1.2,
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    // Setup Lightweight Scroll Reveal Observer (Zero Extra KB)
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Observe elements with .reveal class
    const observeElements = () => {
      document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => {
        revealObserver.observe(el);
      });
    };

    observeElements();
    const mutationObserver = new MutationObserver(observeElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      revealObserver.disconnect();
      mutationObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  // Handle route change scroll to top or hash
  useEffect(() => {
    if (lenisRef.current) {
      if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
          setTimeout(() => {
            lenisRef.current?.scrollTo(target, { offset: -80, immediate: false });
          }, 50);
          return;
        }
      }
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, location.hash]);

  return <>{children}</>;
}
