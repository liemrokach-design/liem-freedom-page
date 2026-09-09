/**
 * Central site configuration.
 *
 * Edit the values below to plug in real assets and integrations.
 * Every field defaults to an empty value ("" / [] ) on purpose — the
 * page renders a clearly-labeled placeholder (or hides the related
 * section entirely) until a real value is provided. Never fill these
 * in with fake/invented data.
 */
window.SITE_CONFIG = {
  // Real hero photo of Liam (front-facing, casual/quality clothing).
  // Example: "assets/hero/liam.jpg"
  HERO_IMAGE: "",

  // Personal story video for the "story" section.
  // Accepts a YouTube video ID (e.g. "dQw4w9WgXcQ") — the page renders
  // a click-to-play thumbnail + embed, matching the hero video pattern.
  STORY_VIDEO: "",

  // Fallback static image for the story section, used only if
  // STORY_VIDEO is empty. Example: "assets/story/liam-story.jpg"
  STORY_IMAGE: "",

  // Approved, anonymized client screenshots for the testimonials
  // section. Each entry needs a real "src" and a descriptive "alt".
  // Leave the array empty to hide the whole testimonials section —
  // never fill it with invented quotes or stock photos.
  TESTIMONIALS: [
    {
      src: "assets/testimonials/client-quote-1.jpg",
      alt: "הודעת וואטסאפ מלקוח: סיכום שבוע אחרי השיחה שלנו, על עלייה בביטחון העצמי ויציאה מאזור הנוחות",
    },
    {
      src: "assets/testimonials/client-quote-2.jpg",
      alt: "הודעת וואטסאפ מלקוח: מאז הזום אני מצליח להיכנס לסטייט יותר בקלות",
    },
    {
      src: "assets/testimonials/client-quote-3.jpg",
      alt: "הודעת וואטסאפ מלקוח: אתה הכי טוב שאני מכיר בנושא הזה, אז סומך עליך בעצות שתיתן לי",
    },
  ],

  // Real social links only. Leave empty to hide the icon entirely
  // (never link to "#").
  INSTAGRAM_URL: "",
  YOUTUBE_URL: "",

  // Not used as a primary CTA (the page's single conversion action is
  // the lead form) — rendered as a secondary footer contact link, and
  // the "פרטים בפרטי" price box links here too.
  WHATSAPP_URL: "https://wa.me/972506805252",
  CONTACT_EMAIL: "",

  // Link to a real, published privacy policy. Leave empty to omit the
  // footer/form link rather than pointing at a placeholder page.
  PRIVACY_POLICY_URL: "",

  // Endpoint the lead form POSTs JSON to: { firstName, phone, message }.
  // See api/lead.js for a ready-to-connect serverless scaffold and the
  // README for wiring instructions. Until this is set, the form's
  // submit handler intentionally short-circuits to the built-in error
  // state — it never fakes a success message.
  LEAD_ENDPOINT: "",

  // Analytics measurement ID (e.g. a GA4 "G-XXXXXXX" ID). Leave empty
  // to keep analytics fully disabled — no script is loaded and no
  // events are sent until this is set and privacy requirements have
  // been reviewed.
  ANALYTICS_ID: "",
};
