const LOGO =
  "https://hnetzvknrnvscvlnqoct.supabase.co/storage/v1/object/public/homepage/site-assets/tkr-logo-white.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="ft-cta">
        <div className="container ft-cta-inner">
          <div>
            <h3>Ready to ride with the Knights?</h3>
            <p>Join our next group ride from Chennai.</p>
          </div>
          <a href="/rides/upcoming">See Upcoming Rides</a>
        </div>
      </div>

      <div className="container ft-main">
        <div className="ft-brand">
          <a href="/" style={{ textTransform: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="The Knight Ryders logo" />
          </a>
          <p>
            A group bike riding community in Chennai, built for Honda CB350 riders. Ride till the last mile.
          </p>
          <div className="ft-socials">
            <a href="https://www.instagram.com/theknightryders/" aria-label="Instagram" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.facebook.com/theknightryders" aria-label="Facebook" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 4h-2.2C10.6 4 9 5.6 9 7.8V10H7v3h2v7h3v-7h2.2l.5-3H12V8c0-.6.4-1 1-1h2V4z" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@TheKnightRyders1" aria-label="YouTube" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
                <path d="M10 9.5l5.5 3-5.5 3v-6z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div className="ft-col">
          <h4>Rides</h4>
          <ul>
            <li><a href="/rides/upcoming">Upcoming Rides</a></li>
            <li><a href="/rides/past">Past Rides</a></li>
            <li><a href="/media">Media</a></li>
            <li><a href="/festivals">Festivals</a></li>
          </ul>
        </div>

        <div className="ft-col">
          <h4>The Club</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/members">Members</a></li>
            <li><a href="/signup">Join the Club</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="ft-col">
          <h4>Get in touch</h4>
          <ul className="ft-contact">
            <li>
              <b>WhatsApp</b>
              <a href="https://wa.me/916381890182" target="_blank" rel="noopener">+91 6381 890 182</a>
            </li>
            <li>
              <b>Based in</b>
              Chennai, Tamil Nadu, India
            </li>
          </ul>
        </div>
      </div>

      <div className="container ft-bottom">
        <span>&copy; {new Date().getFullYear()} The Knight Ryders. All rights reserved.</span>
        <span>Honda CB350 riding club &middot; Chennai</span>
      </div>
    </footer>
  );
}
