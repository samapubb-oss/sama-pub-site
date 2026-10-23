"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

export const META_PIXEL_ID = "996650999787770";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Triggers a standard or custom Meta Pixel event.
 * Examples: trackMetaPixelEvent("Lead", { content_name: "Devis" }), trackMetaPixelEvent("Contact")
 */
export const trackMetaPixelEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (parameters) {
      window.fbq("track", eventName, parameters);
    } else {
      window.fbq("track", eventName);
    }
  }
};

/**
 * Meta Pixel component initializing Pixel ID 996650999787770
 * and tracking route changes across Next.js navigation.
 */
export const MetaPixel: React.FC = () => {
  const pathname = usePathname();

  // Track PageView on route changes
  useEffect(() => {
    if (pathname && typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return (
    <>
      {/* Official Meta Pixel Script */}
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  );
};
