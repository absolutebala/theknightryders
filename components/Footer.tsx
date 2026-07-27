export default function Footer() {
  return (
    <footer>
      <div className="container footer-wrap">
        <a href="/" className="brand" style={{ textTransform: "none" }}>
          <img
            src="https://www.theknightryders.com/wp-content/uploads/2022/03/TKR-Logo-White-1.png"
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
            IG
          </a>
          <a
            href="https://www.facebook.com/theknightryders"
            aria-label="Facebook"
            target="_blank"
            rel="noopener"
          >
            FB
          </a>
          <a
            href="https://www.youtube.com/c/theknightryders1"
            aria-label="YouTube"
            target="_blank"
            rel="noopener"
          >
            YT
          </a>
        </div>
      </div>
    </footer>
  );
}
