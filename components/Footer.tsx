export default function Footer() {
  return (
    <footer>
      <div className="container footer-wrap">
        <a href="/" className="brand" style={{ textTransform: "none" }}>
          <img
            src="https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png"
            alt="The Knight Ryders logo"
            style={{ height: 52 }}
          />
          The Knight Ryders
        </a>
        <div>
          <div className="whatsapp-line">Whatsapp : +91 6381 890 182</div>
          <nav style={{ marginTop: 10 }}>
            <ul>
              <li>
                <a href="/rides/past">Past Rides</a>
              </li>
              <li>
                <a href="/rides/upcoming">Upcoming Rides</a>
              </li>
              <li>
                <a href="/members">Members</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="socials">
          <a
            href="https://www.instagram.com/theknightryders/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/theknightryders"
            aria-label="Facebook"
            target="_blank"
            rel="noopener"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 4h-2.2C10.6 4 9 5.6 9 7.8V10H7v3h2v7h3v-7h2.2l.5-3H12V8c0-.6.4-1 1-1h2V4z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@TheKnightRyders1"
            aria-label="YouTube"
            target="_blank"
            rel="noopener"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M10 9.5l5.5 3-5.5 3v-6z" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
