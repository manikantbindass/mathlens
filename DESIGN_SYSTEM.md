# Modern Dark design system

Authoritative tokens live at the top of `public/styles.css`. Ground #050505, panel #0e0e0e, hairlines #222222/#303030, bright #f2f2f2, read #a6a9ad, meta #8a8d91. Mint #3fd6c6 is restricted to labeled computation status dots. Default type is bundled Geist Regular; labels and values use Geist Mono Regular, aliased as Modern Dark Grotesk/Mono. Both retain their SIL OFL notices.

Shared content maximum 1360px, gutter 48px, gap 24px, panel radius 6px, button pill radius 999px. Display weight is regular, with tight tracking and responsive sizing. Neutral static radial light is limited to mathematical objects; reading surfaces remain opaque.

Sidebar and content share consistent edges. The hero uses a 12-track grid in its intermediate layout, then stacks on smaller containers. Large grids simplify around 1180/900px; navigation becomes a labeled toggle below 680px; entries stack below 560px. Layout testing includes 1440px, tablet widths and 390px.

Interactive states: border/fill hover changes, visible 2px offset focus outline, native labeled form controls, disabled loading buttons, inline errors and live result/feedback regions. Source statuses always have text. Modal search uses native dialog focus containment and Escape handling. A skip link focuses the reading region without changing the application route.

Motion is limited to 120ms ease-out control changes. Static lighting and charts do not move. Reduced-motion disables all transitions and smooth scrolling. Figures provide accessible titles/descriptions; plots are accompanied by computed numerical results and model predictions/trace exports.

Remaining accessibility work: independent WCAG audit, assistive-technology review of all math notation, automated contrast checks and broader browser/zoom testing. No compliance certification is claimed.
